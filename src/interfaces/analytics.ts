export interface CampaignAnalytics {
  sentCount: number;
  name: string;
  createdTime: number;
  links: Link[];
  messagePixel: Pixel;
}

export interface Pixel {
  id: string;
  auth: string;
  readCount: number;
  readHistory: number[];
}

export interface Link extends Pixel {
  url: string;
}

export interface TrackingAnalytics {
  readCount: number;
  readTimeHistory: number[];
}

export interface CreatedTrackingObject {
  id: string;
  auth: string;
}
