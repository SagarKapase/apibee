// Google AdSense publisher ID, for example "ca-pub-1234567890123456" (AdSense → Account → Account information).
// While it is empty the AdSense script is not loaded and ads.txt lists no sellers.
export const ADSENSE_CLIENT: string = "";

// ads.txt needs the ID without the "ca-" prefix.
export const ADSENSE_PUBLISHER_ID = ADSENSE_CLIENT.replace(/^ca-/, "");
