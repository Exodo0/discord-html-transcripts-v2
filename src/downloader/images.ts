import type { APIAttachment, APIMessage, Awaitable } from 'discord.js';
import { request } from 'undici';
import debug from 'debug';

/**
 * Callback used to save an image attachment.
 * The returned string is the URL that will be used in the transcript.
 *
 * `undefined` indicates to use the original attachment URL.
 * `null` indicates to not include the attachment in the transcript.
 * `string` indicates to use the returned URL as the attachment URL (base64 or remote image).
 */
export type ResolveImageCallback = (
  attachment: APIAttachment,
  message: APIMessage
) => Awaitable<string | null | undefined>;

/**
 * Builder to build an image saving callback with optimization.
 */
export class TranscriptImageDownloader {
  private static log = debug('discord-html-transcripts:TranscriptImageDownloader');
  private log = TranscriptImageDownloader.log;

  private maxFileSize?: number; // in kilobytes
  private maxDimensions?: { width: number; height: number };
  private compression?: {
    quality: number; // 1-100
    convertToWebP: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sharpModule: any = null;

  /**
   * Sets the maximum file size for *each* individual image.
   * Images larger than this will be skipped (not downloaded).
   * @param size The maximum file size in kilobytes
   */
  withMaxSize(size: number) {
    this.maxFileSize = size;
    return this;
  }

  /**
   * Sets the maximum dimensions for images. Images larger than this
   * will be resized while maintaining aspect ratio.
   * Requires `sharp` to be installed.
   * @param width Maximum width in pixels
   * @param height Maximum height in pixels
   */
  withMaxDimensions(width: number, height: number) {
    this.maxDimensions = { width, height };
    return this;
  }

  /**
   * Sets the compression quality for each image.
   * Requires `sharp` to be installed. If sharp is not available,
   * images will be saved without compression.
   * @param quality The quality of the image (1 lowest - 100 highest)
   * @param convertToWebP Whether to convert the image to WebP format
   */
  withCompression(quality = 80, convertToWebP = false) {
    if (quality < 1 || quality > 100) throw new Error('Quality must be between 1 and 100');
    this.compression = { quality, convertToWebP };
    return this;
  }

  /**
   * Tries to load sharp. Returns the module or null if not available.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadSharp(): Promise<any | null> {
    if (this.sharpModule !== null) return this.sharpModule;
    try {
      this.sharpModule = await import('sharp');
      return this.sharpModule;
    } catch {
      this.log('sharp not installed - compression and resize disabled');
      return null;
    }
  }

  /**
   * Builds the image saving callback.
   */
  build(): ResolveImageCallback {
    return async (attachment) => {
      // Skip non-image attachments (no width/height = not an image)
      if (!attachment.width || !attachment.height) return undefined;

      // Skip if file is too large (default 10MB limit)
      const maxBytes = (this.maxFileSize ?? 10240) * 1024;
      if (attachment.size > maxBytes) {
        this.log(
          `Skipping ${attachment.id}: file too large (${Math.round(attachment.size / 1024)}KB > ${Math.round(maxBytes / 1024)}KB)`
        );
        return undefined;
      }

      // fetch the image
      this.log(`Fetching attachment ${attachment.id}: ${attachment.url}`);
      const response = await request(attachment.url).catch((err) => {
        console.error(`[discord-html-transcripts] Failed to download image for transcript: `, err);
        return null;
      });

      if (!response) return undefined;

      const mimetype = response.headers['content-type'];
      const buffer = await response.body.arrayBuffer().then((res) => Buffer.from(res));
      this.log(`Finished fetching ${attachment.id} (${buffer.length} bytes)`);

      // Try to optimize with sharp if available
      const sharp = await this.loadSharp();
      if (sharp) {
        try {
          // sharp can be the module itself or { default: sharp }
          const sharpFn = sharp.default || sharp;
          let pipeline = sharpFn(buffer);

          // Resize if dimensions exceed max
          if (this.maxDimensions) {
            const { width, height } = this.maxDimensions;
            if (attachment.width > width || attachment.height > height) {
              pipeline = pipeline.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
              });
              this.log(`Resizing ${attachment.id} to fit ${width}x${height}`);
            }
          }

          // Apply compression
          const quality = this.compression?.quality ?? 75;
          const convertToWebP = this.compression?.convertToWebP ?? false;

          const sharpbuf = await pipeline
            .webp({
              quality,
              force: convertToWebP,
              effort: 2,
            })
            .toBuffer({ resolveWithObject: true });

          this.log(
            `Compressed ${attachment.id}: ${buffer.length} -> ${sharpbuf.info.size} bytes (${Math.round((1 - sharpbuf.info.size / buffer.length) * 100)}% reduction)`
          );

          return `data:image/${sharpbuf.info.format};base64,${sharpbuf.data.toString('base64')}`;
        } catch (err) {
          this.log(`Failed to compress ${attachment.id}, using original: ${err}`);
        }
      }

      // Fallback: return original as base64 (no compression)
      return `data:${mimetype};base64,${buffer.toString('base64')}`;
    };
  }
}
