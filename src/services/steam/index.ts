import axios from "axios";

type GameList = {
  appid: number;
  name: string;
  last_modified: number;
  price_change_number: number;
}[];

type GameData = {
  type: string;
  name: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string;
  pc_requirements: {
    minimum: string;
    recommended: string;
  };
  mac_requirements: any[];
  linux_requirements: any[];
  developers: string[];
  publishers: string[];
  price_overview: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  packages: number[];
  package_groups: [
    {
      name: string;
      title: string;
      description: string;
      selection_text: string;
      save_text: string;
      display_type: number;
      is_recurring_subscription: string;
      subs: [
        {
          packageid: number;
          percent_savings_text: string;
          percent_savings: number;
          option_text: string;
          option_description: string;
          can_get_free_license: string;
          is_free_license: boolean;
          price_in_cents_with_discount: number;
        }
      ];
    }
  ];
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories: [
    {
      id: number;
      description: string;
    }
  ];
  genres: [
    {
      id: string;
      description: string;
    },
    {
      id: string;
      description: string;
    },
    {
      id: string;
      description: string;
    }
  ];
  screenshots: any[];
  movies: any[];
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  support_info: {
    url: string;
    email: string;
  };
  background: string;
  background_raw: string;
  content_descriptors: {
    ids: number[];
    notes: string;
  };
  [key: string]: any;
};

type GamesData = {
  [key: string]: { success: boolean; data: GameData };
};

// https://steamapi.xpaw.me/#IStoreService/GetAppList
export const fetchSteamGames = async ({
  count,
  lastGameId,
  ifModifiedSince,
  haveDescriptionLanguage,
}: {
  count: number;
  lastGameId?: string;
  haveDescriptionLanguage?: string;
  ifModifiedSince?: string;
}) => {
  try {
    const data = await axios.get<{ response: { apps: GameList } }>(
      "https://api.steampowered.com/IStoreService/GetAppList/v1",
      {
        params: {
          key: process.env.STEAM_API_KEY,
          include_games: true,
          last_appid: lastGameId,
          max_results: count,
          have_description_language: haveDescriptionLanguage,
        },
      }
    );

    return data.data?.response.apps;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSteamGameData = async ({ gameId }: { gameId: string }) => {
  try {
    const data = await axios.get<GamesData>(
      "https://store.steampowered.com/api/appdetails",
      {
        params: {
          key: process.env.STEAM_API_KEY,
          appids: gameId,
        },
      }
    );

    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// https://steamapi.xpaw.me/#ISteamNews/GetNewsForApp
export const getSteamLastNews = async ({
  gameId,
  count = 3,
}: {
  gameId: string;
  count?: number;
}) => {
  try {
    const data = await axios.get<Record<string, any>>(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2",
      {
        params: {
          key: process.env.STEAM_API_KEY,
          appid: gameId,
          count,
        },
      }
    );

    return data.data?.appnews.newsitems;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
