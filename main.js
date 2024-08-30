import usCitiesJSON from "./usCitiesJSON.js";
import usJSON from "./usaGeoJSON.js";
import statesJSON from "./usStatesJSON.js";
import data from "./data.js";

class D3 {
  constructor() {
    this.svgHeight = window.innerHeight;
    this.svgWidth = window.innerWidth;
    this.citiesShows = data;
    this.citiesJSON = usCitiesJSON;
    this.usJSON = usJSON;
    this.statesJSON = statesJSON;
    this.initializeD3();
  }
  /*   async fetchCitiesShows() {
    for (let state of Object.keys(STATE_CODES)) {
      let citiesResponse = await axios.get(
        `https://gddb-b7baf449e62a.herokuapp.com/venues/cities?state=${encodeURI(state)}`
      );
      const cities = citiesResponse.data.cities;
      for (let city of cities) {
        let showResponse = await axios.get(
          `https://gddb-b7baf449e62a.herokuapp.com/setlists?state=${encodeURI(state)}&city=${encodeURI(city)}`
        );

        const shows = showResponse.data.setlists.length;
        this.citiesShows.push({ code: STATE_CODES[state], city, shows });
      }
    }
    fs.writeFile("data.js", this.citiesShows);
  } */
  initializeD3() {
    let data = [];

    this.citiesShows.forEach((shows) => {
      this.citiesJSON.forEach((json) => {
        if (shows.code === json.state_id && shows.city === json.city) {
          data.push({ ...json, ...shows });
        }
      });
    });

    var projection = d3
      .geoAlbersUsa()
      .translate([this.svgWidth / 2, this.svgHeight / 2])
      .scale([this.svgWidth]);

    //Define path generator
    this.path = d3.geoPath(projection);

    //Create SVG element
    this.svg = d3
      .select(document.querySelector("svg"))
      .attr("viewBox", [0, 0, this.svgWidth, this.svgHeight])
      .style("background-image", "white");

    this.svg
      .append("defs")
      .append("pattern")
      .attr("id", "image")
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", 0)
      .attr("y", 0)
      .attr("patternContentUnits", "objectBoundingBox")
      .append("svg:image")
      .attr("xlink:xlink:href", "stealie.png")
      .attr("height", 1)
      .attr("width", 1)
      .attr("x", 0)
      .attr("y", 0)
      .attr("preserveAspectRatio", "xMinYMin slice");

    //Bind data and create one path per GeoJSON feature

    this.map = this.svg.append("g");

    this.states = this.map
      .selectAll("path")
      .data(this.usJSON.features)
      .enter()
      .append("path")
      .attr("d", this.path)
      .attr("class", function (d) {
        return `${STATE_CODES[d.properties.NAME]}`;
      })
      .attr("fill", "lightgrey")
      .attr("opacity", 0.75)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round");

    var sqrtScale = d3
      .scaleSqrt()
      .domain([0, Math.max(...data.map((d) => d.shows))])
      .range([Math.min(this.svgHeight, this.svgWidth) / 150, Math.min(this.svgHeight, this.svgWidth) / 15]);

    this.g = this.map.append("g");

    this.cities = this.g
      .selectAll("circle")
      .data(
        data.sort(function (a, b) {
          return b.shows - a.shows;
        })
      )
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection([+d.lng, +d.lat])[0];
      })
      .attr("cy", function (d) {
        return projection([+d.lng, +d.lat])[1];
      })
      .attr("r", function (d) {
        return sqrtScale([d.shows]);
      })
      .attr("id", function (d) {
        return `cityviz${d.state_id}${d.city.replaceAll(" ", "")}`;
      })
      .attr("fill", "url(#image)")
      .attr("fill-opacity", 0.75)
      .attr("stroke", "#fff")
      .attr("stroke-width", "0.1em")
      .style("pointer-events", "none");

    this.legend = this.svg
      .append("g")
      .attr("fill", "black")
      .attr("transform", `translate(${this.svgWidth * 0.9},${this.svgHeight * 0.9})`)
      .attr("text-anchor", "middle")
      .style("font", `${Math.min(this.svgHeight, this.svgWidth) / 70}px sans-serif`)
      .selectAll()
      .data(sqrtScale.ticks(0).concat([300, 200, 100, 50, 10, 1]))
      .join("g");

    this.legend
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", "0.1em")
      .attr("stroke-opacity", 1)
      .attr("cy", (d) => -sqrtScale(d))
      .attr("r", sqrtScale);

    this.legend
      .append("text")
      .attr("y", (d) => -2 * sqrtScale(d))
      .attr("dy", "1em")
      .text(sqrtScale.tickFormat(6, "s"));
  }
}

const STATE_CODES = {
  Arizona: "AZ",
  Alabama: "AL",
  Alaska: "AK",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

new D3();

window.addEventListener("resize", () => {
  document.querySelector("svg").innerHTML = "";
  new D3();
});
