// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const res = await axios.get("https://jservice.io/api/categories", { params: { count: 100 } })
  const NUM_CATEGORIES = res.data.map(val => val.id)
  return _.sampleSize(NUM_CATEGORIES, 6)
}
/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get("https://jservice.io/api/clues", { params: { category: catId } })
  const data = res.data
  const category = {
    title: data[ 0 ].category.title,
    clues: data.map(val => ({
      question: (val.question),
      answer: (val.answer),
      showing: null
    }))
  }
  categories.push(category)
  // console.log('category', category)
  return categories
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
  $("#title-row").empty() //<-- clears the category row
  $("tbody").empty() //<-- clears the clues in the body

  for (let title of categories) { //<-- iterate through categories to get title
    $(`<td>${title.title}</td>`).appendTo("#title-row") //<-- populate top row
  }

  for (let y = 0; y < 5; y++) { //<-- iterate through the table to create rows
    let $clueRows = $(`<tr class='clue-rows'>`)//<-- create row in the table

    for (let x = 0; x < 6; x++) { //<-- iterate through the table to create cols
      $clueRows.append(`<td id='${x}-${y}'>?</td>`) //<-- set id of all cells and show "?"
    }
    $("tbody").append($clueRows) //<-- append the rows to the body
  }
  handleClick()
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick() {
  $("tbody").on('click', "td", function(e) {
    e.stopImmediatePropagation() //<-- stops event bubbling
    e.preventDefault() //<-- stops default refresh 

    const catId = e.target.id[ 0 ] //<-- gets id of category column
    const clueId = e.target.id[ 2 ] //<-- gets id of clue cell
    const catObj = categories[ catId ].clues[ clueId ] //<-- id of obj

    if (!catObj.showing) {
      e.target.innerHTML = catObj.question
      catObj.showing = 'question'
    } else if (catObj.showing === 'question') {
      e.target.innerHTML = catObj.answer
      catObj.showing = 'answer'
    } else if (catObj.showing === 'answer') {
      return
    }
  })

}
/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $(".loader").show()
  $("#play").hide()
  $("#title-row").hide()
  $("tbody").hide()
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $(".loader").hide()
  $("#play").show()
  $("#title-row").show()
  $("tbody").show()
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = []
  const catId = await getCategoryIds()
  for (let items of catId) {
    categories = await getCategory(items)
  }
  await fillTable()
  hideLoadingView()
}

/** On click of start / restart button, set up game. */
$("#play").on("click", function(e) {
  e.preventDefault()
  showLoadingView()
  setupAndStart()
  $("#play").text("Restart?")
})

// TODO

/** On page load, add event handler for clicking clues */

// TODO
