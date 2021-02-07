/* eslint-disable */
export interface Config {
  apiKey: string;
  messageSubject: string;
  messageHTML: string;
  advancedRaw: {
    html: string;
    css: string
  };
  updatePeriodMilliseconds: number;
  queueTime: number;
  configVersion: string;
}

export class Config implements Config {
  apiKey = '';
  messageSubject = '';
  messageHTML = '';
  advancedRaw = {
    html: '',
    css: '',
  };
  updatePeriodMilliseconds = 180000;
  queueTime = 300000;
  configVersion = 'v1.0'; 
}

export interface Message {
  sentTimeMilliseconds: number;
  nation: NationAPICall.Nation | { nation_id: number; nation: string; leader: string; };
  successful: boolean;
  error?: string;
}

export class Message implements Message {
  sentTimeMilliseconds = 0;
  successful = false;
}

export declare module NationAPICall {
  export interface ApiDetails {
      version: string;
      version_expiry: string;
      version_latest: boolean;
  }

  export interface ApiKeyDetails {
      api_key: string;
      nation_id: number;
      alliance_id: number;
      alliance_position: number;
      daily_requests_maximum: number;
      daily_requests_used: number;
      daily_requests_remaining: number;
      requests_per_second_rate_limit: number;
      requests_made_this_second: number;
  }

  export interface ApiRequest {
      success: boolean;
      error_msg?: any;
      api_details: ApiDetails;
      api_key_details: ApiKeyDetails;
  }

  export interface RootObject {
      api_request: ApiRequest;
      data: Nation[];
  }

  export interface Nation {
      nation_id: number;
      nation: string;
      leader: string;
      continent: number;
      war_policy: number;
      domestic_policy: number;
      color: number;
      alliance_id: number;
      alliance: string;
      alliance_position: number;
      cities: number;
      offensive_wars: number;
      defensive_wars: number;
      score: number;
      v_mode: boolean;
      v_mode_turns: number;
      beige_turns: number;
      last_active: string;
      founded: string;
      soldiers: number;
      tanks: number;
      aircraft: number;
      ships: number;
      missiles: number;
      nukes: number;
  }
}

export interface QueuedNation {
  nation: NationAPICall.Nation;
  timeQueued: number;
}