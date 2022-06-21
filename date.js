exports.getDate = function () {
  var date = new Date()
  var options =   {
    day: "numeric",
    weekday: "long",
    month: "long",
  }

  var today = date.toLocaleDateString("en-PH", options)

  return today
}