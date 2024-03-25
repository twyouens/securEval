class Facter {
  constructor(policyFacts) {
    this.facts = {};
    this.initializeFacts(policyFacts)
  }

  initializeFacts(policyFacts) {
    // Initialize facts from policy
    // For each fact in policyFacts, check if it's a static fact and process accordingly
    var initializedFacts = {}
    policyFacts.forEach(fact => {
      if(fact.source == "static") {
        initializedFacts["static-"+fact.name] = this.processStaticFact(fact)
      }else{
        // For request facts, just initialize them with their values
        initializedFacts["request-"+fact.name] = fact.value
      }
    });
    this.facts = initializedFacts;
  }

  processStaticFact(fact) {
    // Handle different types of static facts
    switch (fact.type) {
        case "timeFrame":
            return this.evaluateTimeFrame(fact.value)
        break;
        case "dayFrame":
          return this.evaluateDayFrame(fact.value)
        break;
        case "monthFrame":
          return this.evaluateMonthFrame(fact.value)
        break;
        default:
          return fact.value
    }
  }
  evaluateTimeFrame(timeFrame) {
    // Evaluate if the current time is within the given time frame
    let [startTimeStr, endTimeStr] = timeFrame;
    let currentTime = new Date();

    let startTime = new Date(currentTime);
    let [startHours, startMinutes] = startTimeStr.split(":");
    startTime.setHours(startHours, startMinutes, 0, 0);

    let endTime = new Date(currentTime);
    let [endHours, endMinutes] = endTimeStr.split(":");
    endTime.setHours(endHours, endMinutes, 0, 0);

    // Now compare
    if (currentTime >= startTime && currentTime <= endTime) {
        return "now";
    } else {
        return "outside";
    }
  }
  evaluateDayFrame(dayFrame) {
    // Evaluate if the current day is within the given day frame
    let [startDay, endDay] = dayFrame;
    let currentDay = new Date().getDay();
    if (currentDay >= startDay && currentDay <= endDay) {
        return "now";
    } else {
        return "outside";
    }
  }
  evaluateMonthFrame(monthFrame) {
    // Evaluate if the current month is within the given month frame
    let [startMonth, endMonth] = monthFrame;
    let currentMonth = new Date().getMonth();
    if (currentMonth >= startMonth && currentMonth <= endMonth) {
        return "now";
    } else {
        return "outside";
    }
  }

  updateRequestFacts(requestFacts) {
    // This will only update the request facts that have been initialised in the rule
    // This is to make sure the facts are not tampered with
    for (const [key, value] of Object.entries(requestFacts)) {
        const factName = "request-" + key;
        if (this.facts.hasOwnProperty(factName)) {
            this.facts[factName] = value;
        }
    }
  }
  getFacts() {
    return this.facts;
  }
}

module.exports = Facter;