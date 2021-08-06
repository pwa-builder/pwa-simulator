const VALID_URL_REGEX = new RegExp(
  '^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$',
  'i'
);

/**
 * @param url - The input URL
 * @returns The URL prefixed with https:// and ready to use with the manifest
 * API
 */
export const cleanUrl = (url: string) => {
  let cleanedUrl: string | undefined;
  
  if (url && !url.startsWith('http') && !url.startsWith('https')) {
    cleanedUrl = 'https://' + url;
  }
  
  if (cleanedUrl) {
    if (!isValidURL(cleanedUrl) && !url.toLowerCase().startsWith('http://')) {
      throw new Error('You have a bad https certificate or the url is incorrect.');
    } else {
      return cleanedUrl;
    }
  }
  
  return url;
}

/**
 * @returns True if the input string is a valid URL
 */
const isValidURL = (url: string) => {
  return VALID_URL_REGEX.test(url);
}