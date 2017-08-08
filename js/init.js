( function ( $ ) {
    $( function () {

        // 'use strict';

        //Mateerialize Utilities    *****************
        //******************************

        $( '.button-collapse' ).sideNav();
        $( 'select' ).material_select();



        //VARIABLES    *****************
        //******************************

        let calories;
        let macroGrams = {};
        let optionsList = [];
        let urlEncodedOptionsArray = [];
        let foodDataArray = [];





        let $selectedFood = $( '.form_build-select>option:selected' );

        //calc total grams needed per week o f each p, c, f
        let proteinForWeek
        let carbForWeek;
        let fatForWeek;




        // create array to hold the Grocery List food obj/ifo for each the protein, carb, fats
        let foodChoices = [];
        let foodNutritionData = {};


        const macrosCalPerGram = {
            protein: 4,
            carb: 4,
            fat: 9
        };

        const dietLowCarb = {
            protein: 0.30,
            carb: 0.10,
            fat: 0.60
        };

        const dietLowFat = {
            protein: 0.50,
            carb: 0.40,
            fat: 0.10
        };

        const dietNormal = {
            protein: 0.40,
            carb: 0.40,
            fat: 0.20
        };

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

        /// Get Calculate Input Values
        $calcForm = $( '.calcForm' );
        let $calcFormSex = $( '.form_select-sex option' );
        $calcFormAge = $( '.form_input-age' );
        $calcFormHeight = $( '.form_select-height option' );
        $calcFormWeight = $( '.form_input-weight' );
        $calcFormActivity = $( '.form_select-activity option' );
        $calcFormGoal = $( '.form_select-goal option' );
        $calcFormDiet = $( '.form_select-diet option' );
        $caloriesMacroResult = $( '.section_calc-submit' );

        // Calc Results Values
        $caloriesResult = $( '#calories' );
        $proteinResult = $( '#protein' );
        $carbResult = $( '#carb' );
        $fatResult = $( '#fat' );

        $calcResultResetBtn = $( '#calcResultReset' );

        //Build Select options for API
        $buildFormOptions = $( '.form_build-select option' );
        $buildForm = $( '.form_build-select' );
        $buildFormSubmit = $( '.buildForm' );

        $groceryList = $( '.groceryList' );

        //Search Food Results section
        $searchFoodForm = $( '#searchFoodsForm' );
        $searchFoodResults = $( '#nutritionSearchResult' );

        //Story: as a user I want to find out how many calories i need to loose, maintain, or gain weight


        //FUNCTIONS   *****************
        //******************************

        //funct calculates calories
        function calorieCalc( sex, age, weight, height, activity, goal ) {
            calories = ( 10 * weight ) + ( 6.25 * height ) - ( 5 * age );

            switch ( sex ) {
                case 'Male':
                    calories += 5;
                    break;
                case 'Female':
                    calories -= 161;
                    break;
                default:
                    calories;
            }

            switch ( activity ) {

                case 'Sedentary':
                    calories *= 1.2;
                    break;
                case 'Lightly Active':
                    calories *= 1.375;
                    break;
                case 'Moderately Active':
                    calories *= 1.55;
                    break;
                case 'Very Active':
                    calories *= 1.725;
                    break;
                default:
                    calories;
            }

            switch ( goal ) {

                case 'Lose Weight':
                    calories -= calories * 0.2;
                    break;
                case 'Maintain Weight':
                    calories;
                    break;
                case 'Gain Weight':
                    calories += calories * 0.2;
                    break;

                default:
                    calories;
            }
            calories = calories.toFixed( 0 );
            return calories;
        }



        // funct calc macro % and resulting gramm by diet type
        function calcMacroGrams( dietType ) {
            // mult calories by car/fat/pro each diet type

            macroGrams.protein = ( ( dietType.protein * calories ) / macrosCalPerGram.protein ).toFixed( 0 );

            macroGrams.carb = ( ( dietType.carb * calories ) / macrosCalPerGram.carb ).toFixed( 0 );

            macroGrams.fat = ( ( dietType.fat * calories ) / macrosCalPerGram.fat ).toFixed( 0 );

            return macroGrams;


        }

        //funct calculates macro  based on diet type
        function calcMacrosByDiet() {
            switch ( $calcFormDiet ) {
                case 'Low Carb':
                    calcMacroGrams( dietLowCarb );
                    break;
                case 'Standard Balance':
                    calcMacroGrams( dietNormal );
                    break;
                case 'Low Fat':
                    calcMacroGrams( dietLowFat );
                    break;
                default:
                    return;
            }
        }

        //funct to append calories & macros to
        //displays calories in appropriate div/container
        function showCalcResults() {
            $caloriesResult.text( calories );
            $proteinResult.text( macroGrams.protein );
            $carbResult.text( macroGrams.carb );
            $fatResult.text( macroGrams.fat );
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
        function createFoodLi( foodOption ) {
            let newFoodLi = `<li class="collection-item dismissable foodListItem " data-food="${foodOption}"><div>${foodOption}<i class="secondary-content material-icons">brightness_1</i></div></li>`;
            return newFoodLi;
        }



        ///funct: calc the amount in lbs of all food chosen for week
        function calcFoodAmountNeeded( choicesArray, foodEachChoice, foodType ) {
            //access the array of li for each P,C,F
            let foodChoiceData = {};
            for ( let food = 0; food < choicesArray.length; food++ ) {
                //access the foodDataArray of food object data

                foodDataArray.forEach( ( foodObject ) => {
                    let $food = $( choicesArray[ food ] ).data( 'food' );

                    //match food object names to li text content
                    if ( foodObject.name === $food ) {

                        //calc how much of each to buy
                        foodChoiceData.weight = ((( foodEachChoice / foodObject[ foodType ] ) * foodObject.weight)/448).toFixed(1);
                        //add name
                        foodChoiceData.name = foodObject.name;
                        //add food Choice to array
                        foodChoices.push( foodChoiceData );
                    }
                } );
            }

        }



        //funct: create the Grocery List based on the pro/carb/fat chose and cal/macros per day
        function createGroceryList() {


            // choices of P, C, F in Liist
            let $choiceOfProtein = $( '#proteinChosen li' );
            let $choiceOfCarb = $( '#carbChosen li' );
            let $choiceOfFat = $( '#fatChosen li' );

            //calc total grams needed per week o f each p, c, f
            let proteinForWeek = macroGrams.protein * 7;
            let carbForWeek = macroGrams.carb * 7;
            let fatForWeek = macroGrams.fat * 7;

            // calc grams per p,c,f perweek
            let proteinEachChoice = proteinForWeek / ( $choiceOfProtein.length );
            let carbEachChoice = carbForWeek / ( $choiceOfCarb.length );
            let fatEachChoice = fatForWeek / ( $choiceOfFat.length );

            // match the P/C/F list items to the  food objects in foodDataArray.name
            /// carbs
            calcFoodAmountNeeded( $choiceOfCarb, carbEachChoice, "carb" );

            //  fat
            calcFoodAmountNeeded( $choiceOfFat, fatEachChoice, "fat" );

            //  protein
            calcFoodAmountNeeded( $choiceOfProtein, proteinEachChoice, "protein" );

            ///remove existing grocery li
            $('.groceryListItem').remove();

            let groceryListItem ;
            ///loop through foodChoices array...
            foodChoices.forEach( ( foodObject ) => {

                groceryListItem += `<li class="collection-item dismissable groceryListItem"><div>${foodObject.name}<i class="secondary-content material-icons">brightness_1</i></div><br><div>${foodObject.weight} LBS</div></li>`;

            } );
            $groceryList.append( groceryListItem );
            //access each food object
            // add each food to grocery list ul section as li
        }

        //funct : ajax request to get the nutrtion data for Build / Protein Fat / Carb option
        function ajaxApiBuildData() {

            $.each( urlEncodedOptionsArray, ( food ) => {

                let name = urlEncodedOptionsArray[ food ];
                name = name.replace( '%20', ' ' );
                nutritionAPI += name;
                // console.log( name );
                $.ajax( {
                        type: "GET",
                        url: nutritionAPI,
                        data: foodNutritionData
                    } )
                    .then( function ( foodNutritionData ) {
                        /// access thereturned object data to store the appropriate nutrition
                        // console.log(foodNutritionData);
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

                        // console.log(protein);
                        // console.log(foodNutritionData.ingredients[ 0 ].parsed[ 0 ].nutrients.PROCNT.quantity);


                        var foodNutrition = new FoodData( name, calories, weight, fat, protein, carb );
                        foodDataArray.push( foodNutrition );

                    } );
                //end $.each loop
            } );
        }



        //EVENT LISTENERS    *****************
        //******************************

        // LISTENER EVENTfor Calc Form submission
        $calcForm.submit( ( event ) => {
            event.preventDefault();

            //get form vals
            $calcFormSex = $calcFormSex.filter( ':selected' );
            $calcFormSex = $calcFormSex.text();

            $calcFormAge = parseInt( $calcFormAge.val() );

            $calcFormHeight = $calcFormHeight.filter( ':selected' );
            $calcFormHeight = parseInt( $calcFormHeight.attr( 'value' ) );

            $calcFormWeight = parseInt( $calcFormWeight.val() * 0.45359237 );

            $calcFormActivity = $calcFormActivity.filter( ':selected' );
            $calcFormActivity = $calcFormActivity.text();

            $calcFormGoal = $calcFormGoal.filter( ':selected' );
            $calcFormGoal = $calcFormGoal.text();

            $calcFormDiet = $calcFormDiet.filter( ':selected' );
            $calcFormDiet = $calcFormDiet.text();

            // insert these values into & call the calories function
            calorieCalc( $calcFormSex, $calcFormAge, $calcFormWeight, $calcFormHeight, $calcFormActivity, $calcFormGoal );

            //" "into and call the macros function
            //

            calcMacrosByDiet();
            showCalcResults();
            //hides calc div
            $calcForm.hide();
            //shows results div
            $caloriesMacroResult.fadeIn( 1500 );
            $( 'html, body' ).animate( {
                scrollTop: $caloriesMacroResult.offset().top
            }, 0 );

        } );


        // LISTENER EVENT for Results/Calc Form reset
        $calcResultResetBtn.click( ( event ) => {
            //hides results div
            $caloriesMacroResult.hide();
            //shows calc div
            $calcForm.fadeIn( 1500 );
        } );


        // LISTENER EVENT: when food is selected- add to build list
        $( document ).on( 'change', '.form_build-select', function ( event ) {
            event.stopPropagation();

            $( this ).parents( '.foodChosen' ).find( '.foodChosenList li' ).remove();

            // let $selectedFood = $buildForm.filter( ':selected' );
            let $selectedFood = $( this ).find( 'option:selected' );

            $.each( $selectedFood, ( option, value ) => {

                let $selectedFoodText = $( value ).text();

                // //call function to create li
                let newFood = createFoodLi( $selectedFoodText );

                $( this ).parents( '.foodChosen' ).find( '.foodChosenList' ).append( newFood );

            } );


        } );


        // LISTENER EVENT:  when build submit button is clicked
        $buildFormSubmit.submit( ( event ) => {
            event.preventDefault();
            //reset the foodChoices Array
            foodChoices = [];

            //call function to create Grocery list
            createGroceryList();
        } );

        // LISTENER EVENT for Search Food  submission
        $searchFoodForm.submit( ( event ) => {
            event.preventDefault();

            //shows results div
            $searchFoodResults.show();
        } );

        //Funct Calls    *****************
        //******************************

        //BUILD options list / each option is an object in the optionsList Array

        buildOptionQtySizeNameData( $buildFormOptions );

        encodeOptionTextForApi();
        // call API to build Nutrition Info for optionsList
        ajaxApiBuildData();
        console.log( foodDataArray );



    } ); // end of document ready
} )( jQuery ); // end of jQuery name space
