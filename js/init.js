( function ( $ ) {
    $( document ).ready( function () {

        // 'use strict';

        //Materialize Utilities    *****************
        //******************************

        $( '.button-collapse' ).sideNav( {
            closeOnClick: true
        } );
        $( 'select' ).material_select();
        $( '.parallax' ).parallax();



        //VARIABLES    *****************
        //******************************

        let calories;
        let macroGrams = {};
        let optionsList = [];

        let urlEncodedOptionsArray = [];
        let foodDataArray = [];


        // food from b,l, d build lists..grouped into macro type arrays
        let proteinChoices;
        let carbChoices;
        let fatChoices;
        // create array to hold the Grocery List food obj/ifo for each the protein, carb, fats
        let foodChoices;
        let foodNutritionData = {};

        //search food nutrition data
        let foodNutrition;


        // const macrosCalPerGram = {
        //     protein: 4,
        //     carb: 4,
        //     fat: 9
        // };
        //
        // const dietLowCarb = {
        //     protein: 0.30,
        //     carb: 0.10,
        //     fat: 0.60
        // };
        //
        // const dietLowFat = {
        //     protein: 0.50,
        //     carb: 0.40,
        //     fat: 0.10
        // };
        //
        // const dietNormal = {
        //     protein: 0.40,
        //     carb: 0.40,
        //     fat: 0.20
        // };

        let nutritionAPI = "https://cors-anywhere.herokuapp.com/https://api.edamam.com/api/nutrition-data?app_id=bb5716a9&app_key=4934103f145a552494351407efdecfcf&ingr=1%20medium%20";

        //Constructor funct to create objects for optionsList array
        function OptionData( name ) {
            this.name = name;
        }

        //Constructor funct to create objects for foodDataArray
        function FoodData( name, calories, weight, fat, protein, carb ) {
            this.name = name;
            this.calories = calories;
            this.weight = weight;
            this.fat = fat;
            this.protein = protein;
            this.carb = carb;
        }


        //JQUERY - VARIABLES    *****************
        //******************************

        $btnGetStarted = $( "#download-button" );

        /// Get Calorie & macro Rx Input Values
        $calcForm = $( '.calcForm' );
        $RxcaloriesPerDay = $( '#caloriesRx' );
        $RxproteinPerDay= $( '#proteinRx' );
        $RxcarbPerDay = $( '#carbRx');
        $RxfatPerDay= $( '#fatRx' );


        //Build Card Links
        $buildCard = $( '#buildCard' );
        $buildLinkBreakfast = $( '#linkBuildBreakfast' );
        $buildLinkLunch = $( '#linkBuildLunch' );
        $buildLinkDinner = $( '#linkBuildDinner' );
        $buildLinkSnack = $('#linkBuildSnack');
        $buildBackBtn = $('#buildBackBtn');

        //Build sections
        $buildSection = $('#build');
        $buildBreakfast = $( '#chooseBreakfast' );
        $buildLunch = $( '#chooseLunch' );
        $buildDinner = $( '#chooseDinner' );
        $buildSnack = $('#chooseSnack');

        //Build Select options for API
        $buildFormOptions = $( '.form_build-select option' );
        $buildForm = $( '.section_BuildList' );
        $buildFormSubmit = $( '.buildForm' );
        $buildBtnBack = $( '.btnBackBuild' );
        $buildSectionBackBtn = $('#buildSectionBackBtn');

        let $selectedFood = $( '.form_build-select>option:selected' );
        let $groceryListSection = $( '.section_GroceryList' );
        $groceryList = $( '.groceryList' );

        //Search Food Results section
        $searchFoodForm = $( '#searchFoodsForm' );
        let $searchFoodName;
        $searchFoodResultsDiv = $( '#nutritionSearchResult' );
        $searchFoodResultsSpan = $( '#nutritionSearchResultSpan' );
        $caloriesSearchResult = $( '#caloriesSearch' );
        $proteinSearchResult = $( '#proteinSearch' );
        $carbSearchResult = $( '#carbSearch' );
        $fatSearchResult = $( '#fatSearch' );
        $foodSearchResult = $( '#foodSearch' );


        //FUNCTIONS****************************************** FUNCTIONS
        //************************************************************

        function showSearchResults() {
            $foodSearchResult.text( foodNutrition.name );
            $caloriesSearchResult.text( foodNutrition.calories );
            $proteinSearchResult.text( foodNutrition.protein );
            $carbSearchResult.text( foodNutrition.carb );
            $fatSearchResult.text( foodNutrition.fat );

        }


        //funct to create an object with Build Food Items qty=1, size, name   from html list
        function buildOptionQtySizeNameData() {
            //loop through select options
            $.each( $buildFormOptions, ( option, value ) => {

                let optionText = value;
                optionText = optionText.textContent;

                if ( optionText !== "Choose your option" ) {

                    let tempOption = new OptionData( optionText );
                    //add new option object with option name to options list array
                    optionsList.push( tempOption );
                }
            } );
            // console.log(optionsList);
            deleteDuplicateFoods(optionsList);
            // console.log(optionsList);
        }


        //FUNCTION: eliminate duplicate food options for optionsList array
// BUG CANNOT REMOVE DUPLICATE OPTIONS FROM OPTIONS LIST ARRAY
        function deleteDuplicateFoods (optionsListArray) {

            let optionsListDupsRemoved = [];
            // iterate through OptionsList array of objects

            optionsList.forEach((foodOption)=>{

                let foodOptionName = foodOption['OptionData']['name'];
                optionsListDupsRemoved.push (foodOptionName);
                //add each option object to new array if OptionData['name'] not already

                optionsListDupsRemoved.forEach( (option)=>{

                    if (foodOptionName === option) {

                        optionsListArray.unshift(option)
                    }
                });
            });
            console.log(optionsListArray);
            // optionsList = optionsListDupsRemoved;
        }

        //function to create url string for api request that includes the ingredient url encoded and the quantity and the size
        function encodeOptionTextForApi() {
            // loop through optionsList
            $.each( optionsList, ( optionObject, value ) => {
                //put each obj value into a string
                let tempObjString = "";

                for ( let key in value ) {

                    tempObjString = value[ key ];
                    // replace white space with %20
                    tempObjString = tempObjString.split( ' ' ).join( '%20' );
                    //put each string as item in urlEncodedOptionsArray
                    urlEncodedOptionsArray.push( tempObjString );
                }
            } );
        }

        //funct: creates new li with basic content and leaves places to add the nutrition values
        function createFoodLi( foodOption, macro ) {
            let newFoodLi = `<li class="collection-item dismissable foodListItem " data-macrotype="${macro}" data-food="${foodOption}"><div>${foodOption}<i class="secondary-content material-icons">brightness_1</i></div></li>`;
            return newFoodLi;
        }


        // function to  group al P, C, F from the breakfast, lunch, dinner, snack
        // need arrays for each p,c,f and then get length of each to determine the qty of choices by group
        function calcBuildListMacroGroupQtys( breakfast, lunch, dinner, snack ) {

            let allMeals = breakfast.concat(lunch, dinner, snack );
            proteinChoices = [];
            carbChoices = [];
            fatChoices = [];

                for (let i = 0; i < allMeals.length; i ++) {

                    let foodSelection = allMeals[i];
                    let $foodMacroType = $(foodSelection).attr('data-macrotype');

                    if ( $foodMacroType == "protein" ) {
                        proteinChoices.push( foodSelection );

                    }
                    else if ( $foodMacroType == "carb" ) {
                        carbChoices.push( foodSelection );
                    }
                    else if ( $foodMacroType == "fat" ) {
                        fatChoices.push( foodSelection );
                    }
                }
                // console.log(proteinChoices);
        }

        ///funct: calc the amount in lbs of all food chosen for week
        function calcFoodAmountNeeded( choicesArray, macroPerWeek, macro ) {
            //access the array of li for each P,C,F

            for ( let i = 0; i < choicesArray.length ;  i ++ ) {

                var foodChoiceData = {};
                //access the foodDataArray of food object data
                for ( let j = 0; j < foodDataArray.length; j++ ) {

                    let $food = $( choicesArray[ i ] ).data( 'food' ) + "%20";

                    //match food object names to li text content
                    if (foodDataArray[ j ].name === $food ){

                        //add name
                        foodChoiceData.name = foodDataArray[ j ].name.replace("%20", "");

                        //calc how much of each to buy
                        foodChoiceData.weight = ( ( ( macroPerWeek / foodDataArray[ j ][ macro ] ) * foodDataArray[ j ].weight ) / 448 ).toFixed( 1 );

                        //add food Choice to array
                        foodChoices.push( foodChoiceData );


                    }

                }
            }
            // console.log(foodChoices);

        }


        //funct: create the Grocery List based on the pro/carb/fat chose and cal/macros per day
        function createGroceryList() {

            // choices of food for B, L, D, S in Build Lists
            let $foodForBreakfast = $( '#breakfastList li' ).toArray();
            let $foodForLunch = $( '#lunchList li' ).toArray();
            let $foodForDinner = $( '#dinnerList li' ).toArray();
            let $foodForSnacks = $('#snackList li').toArray();

            // console.log($foodForSnacks);

            // sorts all food chosen & stores into global variable: arrays
            calcBuildListMacroGroupQtys( $foodForBreakfast, $foodForLunch, $foodForDinner, $foodForSnacks );

            // calc grams per p,c,f perweek
            let proteinEaChoicePerWk = ($RxproteinPerDay)*7  / ( proteinChoices.length );
            let carbEaChoicePerWk = ($RxcarbPerDay)*7/ ( carbChoices.length );
            let fatEaChoicePerWk = ($RxfatPerDay)*7 / ( fatChoices.length );



            calcFoodAmountNeeded( carbChoices, carbEaChoicePerWk, "carb" );

            //  fat
            calcFoodAmountNeeded( fatChoices, fatEaChoicePerWk, "fat" );

            //  protein
            calcFoodAmountNeeded( proteinChoices, proteinEaChoicePerWk, "protein" );

            ///remove existing grocery li
            $( '.groceryListItem' ).remove();

            var groceryListItem;
            ///loop through foodChoices array...

    // console.log(foodChoices);
            foodChoices.forEach( ( foodObject ) => {

                groceryListItem = `<li class="collection-item dismissable groceryListItem">${foodObject.name}<i class="secondary-content material-icons">brightness_1</i>   ${foodObject.weight} LBS</li>`;
                $groceryList.append( groceryListItem );
            } );

            //access each food object
            // add each food to grocery list ul section as li
        }

        //funct : ajax request to get the nutrtion data for Build / Protein Fat / Carb option
        function ajaxApiBuildData() {

            $.each( urlEncodedOptionsArray, ( food ) => {

                let name = urlEncodedOptionsArray[ food ];
                name = name.replace( '%20', ' ' );
                name += "%20";
                nutritionAPI += name;
                // console.log( name );
                $.ajax( {
                        type: "GET",
                        url: nutritionAPI,
                        data: foodNutritionData
                    } )
                    .then( function ( foodNutritionData ) {
                        /// access thereturned object data to store the appropriate nutrition

                        let calories = foodNutritionData.calories;
                        let weight = foodNutritionData.totalWeight;

                        let fat = 0.01;
                        if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.FAT.quantity ) {
                            fat = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.FAT.quantity;

                        }


                        let carb = 0.01;
                        if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.CHOCDF ) {
                            carb = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.CHOCDF.quantity;
                        }


                        let protein = 0.01;

                        if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.PROCNT.quantity ) {
                            protein = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.PROCNT.quantity;
                        }


                        var foodNutrition = new FoodData( name, calories, weight, fat, protein, carb );
                        foodDataArray.push( foodNutrition );

                    } );
                //end $.each loop
            } );
        }

        //FUNCTION: CALL API FOR FOOD SEARCH
        function ajaxApiSearchFood() {
            nutritionAPI = "https://cors-anywhere.herokuapp.com/https://api.edamam.com/api/nutrition-data?app_id=bb5716a9&app_key=4934103f145a552494351407efdecfcf&ingr=1%20medium%20";

            $searchFoodName = $( '#foodName' ).val();
            let name = $searchFoodName;

            $searchFoodName = $searchFoodName.replace( ' ', '%20' );

            nutritionAPI += $searchFoodName;
            // console.log(nutritionAPI);

            $.ajax( {
                    type: "GET",
                    url: nutritionAPI,
                    data: foodNutritionData
                } )
                .then( function ( foodNutritionData ) {
                    /// access thereturned object data to store the appropriate nutrition


                    let calories = foodNutritionData.calories;
                    let weight = foodNutritionData.totalWeight;

                    let fat = 0.01;
                    if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.FAT.quantity ) {
                        fat = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.FAT.quantity;
                    }

                    let carb = 0.01;
                    if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.CHOCDF ) {
                        carb = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.CHOCDF.quantity;
                    }


                    let protein = 0.01;

                    if ( foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.PROCNT.quantity ) {
                        protein = foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.PROCNT.quantity;
                    }

                    weight = weight.toFixed( 0 );
                    calories = calories.toFixed( 0 );
                    fat = fat.toFixed( 0 );
                    protein = protein.toFixed( 0 );
                    carb = carb.toFixed( 0 );


                    foodNutrition = new FoodData( name, calories, weight, fat, protein, carb );

                    //call function to add foodNutrition into results div
                    showSearchResults();
                } );
        }


        //EVENT LISTENERS    ***************************EVENT LISTENERS
        //************************************************************


        $btnGetStarted.click( () => {

            $( 'html, body' ).animate( {
                scrollTop: $calcForm.offset().top
            }, 2000 );
        } );


        // LISTENER FOR:  Rx Calorie & Macro Form submission
        $calcForm.submit( ( event ) => {
            event.preventDefault();

            $calcForm.hide();
            $buildSection.fadeIn( 1500 );
            $( 'html, body' ).animate( {
                scrollTop: $buildSection.offset().top
            }, 2000 );

            $RxcaloriesPerDay = parseInt( $RxcaloriesPerDay.val() );
            $RxproteinPerDay= parseInt( $RxproteinPerDay.val() );
            $RxcarbPerDay = parseInt( $RxcarbPerDay.val() );
            $RxfatPerDay= parseInt( $RxfatPerDay.val() );

        } );


        // LISTENER FOR: Build Section Back Button
        $buildSectionBackBtn .click( () => {
            $buildSection.hide();
            $calcForm.fadeIn( 2000 );
            $( 'html, body' ).animate( {
                scrollTop: $calcForm.offset().top
            }, 2000 );

        } );

        // LISTENER for when links on BUILD card for breakfast clicked
        $buildLinkBreakfast.click( () => {
            $buildCard.hide();
            $buildForm.fadeIn( 1000 );
            $buildBreakfast.fadeIn( 2000 );
            $( 'html, body' ).animate( {
                scrollTop: $buildForm.offset().top
            }, 2000 );

        } );


        // LISTENER for when links on BUILD card for  lunch clicked
        $buildLinkLunch.click( () => {
            $buildCard.hide();
            $buildForm.fadeIn( 1000 );
            $buildLunch.fadeIn( 2000 );
            $( 'html, body' ).animate( {
                scrollTop: $buildForm.offset().top
            }, 2000 );

        } );

        // LISTENER for when links on BUILD card for dinner clicked
        $buildLinkDinner.click( () => {
            $buildCard.hide();
            $buildForm.fadeIn( 1000 );
            $buildDinner.fadeIn( 2000 );
            $( 'html, body' ).animate( {
                scrollTop: $buildForm.offset().top
            }, 2000 );

        } );

        // LISTENER for when links on BUILD card for dinner clicked
        $buildLinkSnack.click( () => {

            $buildCard.hide();
            $buildForm.fadeIn( 1000 );
            $buildSnack.fadeIn( 2000 );
            $( 'html, body' ).animate( {
                scrollTop: $buildForm.offset().top
            }, 2000 );

        } );

        //LISTENER for when BACK button clicked on build forms
        $buildBtnBack.click( () => {
            $buildCard.fadeIn( 1000 );

            $( 'html, body' ).animate( {
                scrollTop: $buildCard.offset().top
            }, 2000 );

            $buildForm.hide();
            $buildBreakfast.hide();
            $buildLunch.hide();
            $buildDinner.hide();
            $buildSnack.hide();
        } );


        // LISTENER FOR when food is selected- add to BUILD LIST
        $( document ).on( 'change', '.form_build-select', function ( event ) {
            event.stopPropagation();
            let $selectedFoodText="";
            let $selectedFoodMacro="";

            $( this ).parents( '.foodChosen' ).find( '.foodChosenList li' ).remove();

            let $selectedFood = $( this ).find( 'option:selected' );

            $.each( $selectedFood, ( option, value ) => {


                 $selectedFoodText = $( value ).text();


                 $selectedFoodMacro = $( value ).attr( 'class' );


                // //call function to create li
                let newFood = createFoodLi( $selectedFoodText, $selectedFoodMacro );

                $( this ).parents( '.foodChosen' ).find( '.foodChosenList' ).append( newFood );
            } );
        } );

        // LISTENER EVENT:  when build submit button is clicked
        $buildFormSubmit.submit( ( event ) => {
            event.preventDefault();
            //show grocery list section
            $groceryListSection.fadeIn( 1000 );
            $( 'html, body' ).animate( {
                scrollTop: $groceryListSection.offset().top
            }, 2000 );

            //reset the foodChoices Array
            foodChoices = [];
            //call function to create Grocery list
            createGroceryList();
        } );

        // LISTENER EVENT for Search Food  submission
        $searchFoodForm.submit( ( event ) => {
            event.preventDefault();
            foodNutrition = {};
            //call function for API call
            ajaxApiSearchFood();

            //shows results div
            $searchFoodResultsDiv.show();

            $( 'html, body' ).animate( {
                scrollTop: $( "#nutritionSearchResult" ).offset().top
            }, 2000 );
        } );




        //FUNCTION CALLS  ******************************FUNCTION CALLS
        //************************************************************

        //BUILD options list / each option is an object in the optionsList Array
        buildOptionQtySizeNameData( $buildFormOptions );

        encodeOptionTextForApi();
        // call API to build Nutrition Info for optionsList
        ajaxApiBuildData();

    } ); // end of document ready
} )( jQuery ); // end of jQuery name space
