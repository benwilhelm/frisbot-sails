module.exports = {

  isBcrypted: function(str) {
    return !!str.match(/^\$[\w\d]{1,2}\$[\d]{2}\$[\w\d\.\/]{53}$/)
  }
}