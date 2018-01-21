import * as Twit from "twit";

export default class Twitter {
  private T: Twit;

  constructor(params: Twit.Options) {
    this.T = new Twit(params);
  }

  search(params?: Twit.Params) {
    return this.T.get("search/tweets", params);
  }

  retweet(id: string, callback: Twit.Callback) {
    return this.T.post("statuses/retweet", { id }, callback);
  }
}
