import React from "react";
import "../App.css";
import moment from "moment";

//when submitting an event it will grab the user information based on cookies logged in
// 1.query the database to get user id
// 2.add user id to event info
// 3.if creator the select yes for database
class CreateEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      userRef: []
    };
  }

  updateUser = i => {
    let self = this;

    fetch(`/api/userfind/${i}`)
      .then(function(results) {
        return results.json();
      })
      .then(function(refId) {
        let userReference = JSON.parse(refId);
        self.updateState(userReference.id);
      });
  };
  updateState = id => {
    this.setState({
      userRef: id
    });
  };

  componentDidMount() {
    //checking if signed in ------------------------------

    //--------------------------------------------------------

    //check cookies and get user information --------------

    let logged = sessionStorage.getItem("logged");
    if (logged === "false") {
      alert("you must log in");
      window.location.href = "/signin";
    } else {
      let userId = document.cookie.split("=");
      this.updateUser(userId[1]);
    }
  }
  // ----------------------------------------------

  // handing submit of form------------------------
  handleSubmit = e => {
    e.preventDefault();
    let eventInfo = {};

    let radio = document.getElementsByName("contact");

    for (var i = 1; i < e.target.length; i++) {
      switch (e.target[i].name) {
        case "volunteerNum":
          eventInfo.volunteers_needed = e.target[i].value;
          break;
        case "groupName":
          eventInfo.group_name = e.target[i].value;
          break;

        case "startDate":
          eventInfo.start_date = moment(e.target[i].value).format("YYYYMMDD");
          break;
        case "startTime":
          eventInfo.start_time = e.target[i].value;
          break;
        case "endTime":
          eventInfo.end_time = e.target[i].value;
          break;
        case "eventAddress":
          eventInfo.address = e.target[i].value;
          break;
        case "eventCity":
          eventInfo.city = e.target[i].value;
          break;
        case "eventState":
          eventInfo.state = e.target[i].value;
          break;
        case "eventZipcode":
          eventInfo.zip = e.target[i].value;
          break;
        default:
          continue;
      }
      eventInfo.creator = "true";
      eventInfo.user_id = this.state.userRef;
    }

    //loop through radio choice and save in object
    for (let i = 0; i < radio.length; i++) {
      if (radio[i].checked) {
        eventInfo.contact = radio[i].value;
        break;
      } else {
        continue;
      }
    }
    console.log(eventInfo);

    //send data to the event database
    fetch("/api/newInfo/addEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(eventInfo)
    }).then(function() {
      window.location.href = "/userlogged";
    });
  };

  //form ends--------------------------------------------------------

  //with the users permission this grabs the lat and long of the users location and fetches an API response that provides an address close to those coordinates
  handleLocationClick = e => {
    let self = this;
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(function(location) {
      console.log(location.coords.latitude);
      console.log(location.coords.longitude);
      let lat = location.coords.latitude;
      let long = location.coords.longitude;
      //send to function that will query the coordinates and split back an address
      fetch(
        "http://nominatim.openstreetmap.org/reverse?format=json&lat=" +
          lat +
          "&lon=" +
          long +
          "&zoom=18&addressdetails=1",
        {
          method: "GET"
        }
      )
        .then(function(results) {
          return results.json();
        })
        .then(function(results) {
          //splits the response into an array so the information is easy to use
          let addressArray = results.display_name.split(",");
          let information = {
            address: addressArray[0] + addressArray[1],
            city: addressArray[2],
            state: addressArray[4],
            zip: addressArray[5]
          };

          //send information object to a function that gets the inputs and places these values as the input values

          self.changeInputValues(information);
        });
    });
  };

  //function takes information gathered from location API and places it into the input boxes as values
  changeInputValues = locationInfo => {
    //grabs the form and all inputs. if the inputs match what is being searched then a value is placed in the box
    let Inputs = document.getElementById("createEvent");

    for (let i = 0; i < Inputs.length; i++) {
      switch (Inputs[i].name) {
        case "eventAddress":
          Inputs[i].value = locationInfo.address;
          break;
        case "eventCity":
          Inputs[i].value = locationInfo.city;
          break;
        case "eventState":
          Inputs[i].value = locationInfo.state;
          break;
        case "eventZipcode":
          Inputs[i].value = locationInfo.zip;
          break;
      }
    }
  };

  render() {
    return (
      <div>
        <header id="createEventHeader">
          <div>Welcome {this.state.name} !</div>
          <h1>Create an Event</h1>
          <p>
            Cleaning up the neighborhood has never been easier! Take 5 minutes
            to fill out the form and you are on you way to making the world a
            better place
          </p>
        </header>

        <section>
          {this.state.name}
          <form id="createEvent" onSubmit={this.handleSubmit}>
            <fieldset>
              <legend>Group Information</legend>
              {/* <input
                type="text"
                name="leaderFirstName"
                placeholder="Group Leader First Name"
              />
              <input
                type="text"
                name="leaderLastName"
                placeholder="Group Leader Last Name"
              /> */}
              <input type="text" name="groupName" placeholder="Group Name" />
              <input
                type="number"
                name="volunteerNum"
                placeholder="Number of volunteers needed"
              />
              <h5>Volunteers can contact me by:</h5>

              <label id="radioSection">
                <label className="rad">
                  <input type="radio" name="contact" value="email" /> Listed
                  Email
                </label>
                <label className="rad">
                  <input type="radio" name="contact" value="phone" /> Listed
                  Phone
                </label>
                <label className="rad">
                  <input type="radio" name="contact" value="emailphone" /> Both
                </label>
              </label>
              {/* <input
                type="email"
                name="leaderEmail"
                placeholder="Group Leader Email"
              />
              <input
                type="text"
                name="leaderPhone"
                placeholder="Group Leader phone number"
              /> */}
            </fieldset>
            <fieldset className="eventSectionInfo">
              <legend>Event Information</legend>
              <label>
                Start Date
                <input type="date" name="startDate" />
              </label>
              <label>
                Start Time
                <input type="time" name="startTime" />
              </label>
              <label>
                End Time
                <input type="time" name="endTime" />
              </label>
              <legend>Location</legend>
              <button onClick={this.handleLocationClick}>
                Use Current Location
              </button>
              <label>
                Address
                <input type="text" name="eventAddress" />
              </label>
              <label>
                City
                <input type="text" name="eventCity" />
              </label>
              <label>
                State
                <input type="text" name="eventState" />
              </label>
              <label>
                Zipcode
                <input type="text" name="eventZipcode" />
              </label>
            </fieldset>

            <input type="submit" value="Create Event" />
          </form>
        </section>
      </div>
    );
  }
}
export default CreateEvent;
