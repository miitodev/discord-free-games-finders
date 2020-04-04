function SortStable(array) {
  let arrayCopy = [...array]
  arrayCopy.sort((a, b) => {
    const nameA = a.title.toUpperCase();
    const nameB = b.title.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0
  })

  return arrayCopy
}


module.exports = {
  SortStable
}
