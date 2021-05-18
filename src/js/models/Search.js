import axios from "axios";

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults(query) {
    try {
      const options = {
        method: "GET",
        url: "https://tasty.p.rapidapi.com/recipes/list",
        params: {
          from: "0",
          size: "20",
          tags: "under_30_minutes",
          q: `${this.query}`,
        },
        headers: {
          "x-rapidapi-key":
            "a0eec37cc0mshf463076ebe117f2p1ea968jsneb32a346b154",
          "x-rapidapi-host": "tasty.p.rapidapi.com",
        },
      };
      axios
        .request(options)
        .then(function (response) {
          console.log("tasty:", response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/search?&q=${this.query}`
      );
      console.log(res);
      this.result = res.data.recipes;
      //console.log(this.result)
    } catch (error) {
      alert(error);
    }
  }
}
