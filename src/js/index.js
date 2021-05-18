import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app 
// - Search object
// - Current Recipe object
// - Shopping list object
// - Liked recipes 
const state = {};

/*
Search Controller 
*/
const controlSearch =  async () => {
    //1. get query from the view 
    const query = searchView.getInput()
    //const query = 'pizza'
    
    if (query) {
        //2. New search object and add to state 
        state.search = new Search(query)    
    
        //3. Prepare UI for results
        searchView.clearInput()
        searchView.clearResults()
        renderLoader(elements.searchRes)
        //4. Search for recipes 
        try {
            await state.search.getResults()
    
            //5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('something went wrong')
            clearLoader();            
        }
        
    }

};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})
// //testing
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// })


elements.searchResPages.addEventListener('click',e => {
    const btn = e.target.closest('.btn-inline')
    if(btn) {
        const gotopage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults()
        searchView.renderResults(state.search.result, gotopage);
    }
    
})
/*
Recipe Controller 
*/

const controlRecipe = async () => {
    //get the id from the url
    const id = window.location.hash.replace('#', '');
    //console.log(id)

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe)
       //highlight selected search 
       if (state.search) searchView.highlightSelect(id)
       
       
        //Create new recipe object
        state.recipe = new Recipe(id)
        //window.r = state.recipe;

        //get recipe data
        try {
            //Get recipe and parse ingredients 
            await state.recipe.getRecipe(); 
            state.recipe.parseIngredients()
            //calculate sercings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // Render recipe 
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch (err){
            alert('error procesing recipe!')
        }
    }
}
// window.addEventListener('hashchange', controlRecipe)
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))

/*
** List controller
*/
const controlList= () => {
    //Create a new list IF there is non yet
    if (!state.list) state.list = new List()
    // Add each ingredient to the list and update UI 
    state.recipe.ingredients.forEach(e => {
        const item = state.list.additem(e.count, e.unit, e.ingredient)
        listView.renderItem(item)
    })
}

// Handle delete nad update list item events 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    //Handle delete button 
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id)

        // Delete item from UI
        listView.deleteItem(id)
    
        
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value)
        state.list.updateCount(id, val)
    }
});


/*
**** Like controller
*/


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id; 
   
    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentId)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //Toggle the like button
        likesView.toggleLikeBtn(true)
        //Add like to the UI list
        likesView.renderLike(newLike)
      //  console.log(state.likes)
     // User HAS liked current recipe
    } else {
        //Remove like from the state
        state.likes.deleteLike(currentId)

        //Toggle the like button 
        likesView.toggleLikeBtn(false)

        //Remove like from the UI list
        likesView.deleteLike(currentId)

        //console.log(state.likes)
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
};
// Restore liked recipeon page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage()

    //Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes())

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like))
})


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
        //Decrease btn is clicked 
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button is clicked 
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
       // Add ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //like controller 
        controlLike();

    }

});
