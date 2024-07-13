import React,{useState,useEffect} from 'react';
import { Text ,View , StyleSheet,ImageBackground , Button,ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import backgroundImage from '../../assets/image1.jpg';
import DropdownComponent from '../DropDown/Dropdown';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import nonveg from '../../data/nonveg.json'
const consumptionOptions = [
    { label: 'Immediate Consumption', value: 'immediate' },
    { label: 'Regular Consumption', value: 'regular' },
  ];
  
  const locationOptions = [
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    // Add all other states similarly
    { label: 'West Bengal', value: 'West Bengal' },
  ];
  
  const filterOptions = [
    { label: 'Filter by Consumption', value: 'consumption' },
    { label: 'Filter by Location', value: 'location' },
  ];
function ResultsScreen({ route, navigation }) {
  const {finalValue} = route.params || 0;
  console.log(finalValue,"final")
const [selectedFilter, setSelectedFilter] = useState(null); // Track selected filter
  const [selectedOption, setSelectedOption] = useState(null); // Track selected option
  const [filteredDataArray, setFilteredDataArray] = useState([]); // Store filtered data
  const [data, setData] = useState(finalValue); // Placeholder for data
  const [locationRendered,setLocationRendered] = useState(false)

  // Function to fetch location-based data
  const getLocationData = () => {
    if (selectedFilter === 'location') {
      // Filter and set filtered data based on selected option
      const filteredData = Object.keys(nonveg)
        .filter(state => state === selectedOption)
        .reduce((obj, key) => {
          obj[key] = nonveg[key];
          return obj;
        }, {});
      
      setFilteredDataArray([filteredData]);
       // Update filtered data array
    } else {
      setFilteredDataArray([]); // Clear filtered data array for other cases
    }
  };

  // Function to get options for filter dropdown
  const getOptionsForFilter = () => {
    if (selectedFilter === 'consumption') {
      return consumptionOptions; // Return consumption options
    } else if (selectedFilter === 'location') {
      return locationOptions; // Return location options
    }
    return []; // Default empty array if no filter selected
  };

  // Function to get default option for filter dropdown
  const getDefaultOptionForFilter = () => {
    if (selectedFilter === 'consumption') {
   
      return consumptionOptions[0].value; // Default to first consumption option
    } else if (selectedFilter === 'location') {
    
      return locationOptions[0].value; // Default to first location option
    }
    return null; // Default to null if no filter selected
  };

  // Default value for filter option
  const defaultfilteroption = () => {
    return filterOptions[0].value; // Default to first filter option
  };

  // useEffect to set default option when selected filter changes
  useEffect(() => {
    // Log filteredDataArray and selectedOption after state update
    console.log(filteredDataArray, "array");
    console.log(selectedOption, "option");
    // Log specific result if available
    if (filteredDataArray.length > 0 && filteredDataArray[0][selectedOption]) {
      console.log(filteredDataArray[0][selectedOption].dos[0], "result");
    }
  }, [filteredDataArray, selectedOption]);
  useEffect(() => {
    if (selectedFilter) {
      setSelectedOption(getDefaultOptionForFilter()); // Set default option based on selected filter
    }
    selectedFilter === 'location'? setLocationRendered(true) : setLocationRendered(false)
  }, [selectedFilter]);

  // useEffect to fetch location-based data when selected option changes
  useEffect(() => {
    if (selectedFilter === 'location') {
      getLocationData();
     
    }
    
  }, [selectedOption]);


    return (
        <ImageBackground
      source={backgroundImage}
      class="h-full w-full"
    >
        <View className="rounded-lg overflow-hidden h-[25%] m-4 p-3">
            <Text className='text-center font-bold text-base'>Results</Text>
            <Text style={styles.text}>Select Filter</Text>
      <DropdownComponent
        data={filterOptions}
        placeholder="Select filter"
        searchPlaceholder="Search filter"
        onSelect={(value) => {
          setSelectedFilter(value);
        }}
        defaultValue={defaultfilteroption()}// Reset the second dropdown 
      />
      
      {selectedFilter && (
        <>
          <Text style={styles.text}>Select Option</Text>
          <DropdownComponent
            data={getOptionsForFilter()}
            placeholder="Select option"
            searchPlaceholder="Search option"
            onSelect={(value) => setSelectedOption(value)}
            defaultValue={getDefaultOptionForFilter()}
          />
        </>
      )}
      
      {selectedOption && (
        <Text style={styles.text}>Selected Option: {selectedOption}</Text>
      )}
            </View>
            <View className="h-[75%] bg-white p-7"  style={styles.roundedTop}>
              {data>170?(
                <View className="h-full">
                <Text className="font-bold mb-5">Recommended diet</Text>
                { locationRendered  && (<View>
                  {filteredDataArray.length > 0 && filteredDataArray[0][selectedOption] && (
                  <>
                      <Text className="text-green-600 text-lg">Do's <FontAwesome5 name="check-circle" size={15} color="#25ad23" /></Text>
                      <Text className="mt-5 text-lg rounded-lg overflow-hidden shadow-lg bg-slate-100 p-3">{filteredDataArray[0][selectedOption].dos[0]}</Text>
                      <Text className="mt-5 text-lg rounded-lg overflow-hidden shadow-lg bg-slate-100 p-3">{filteredDataArray[0][selectedOption].dos[1]}</Text>
                      </>)}
                      {filteredDataArray.length > 0 && filteredDataArray[0][selectedOption] && (
                  <>
                      <Text className="text-red-500 text-lg mt-5">Dont's <FontAwesome5 name="times-circle" size={15} color="#eb4d4d" /></Text>
                      <Text className="mt-5 text-lg rounded-lg overflow-hidden shadow-lg bg-slate-100 p-3">{filteredDataArray[0][selectedOption].donts[0]}</Text>
                      <Text className="mt-5 text-lg rounded-lg overflow-hidden shadow-lg bg-slate-100 p-3">{filteredDataArray[0][selectedOption].donts[1]}</Text>
                      </>)}
                    </View>)}
                {selectedOption=='immediate' && (
                  <View>
                
                  <Text>
           
1. Insulin or Medication: If you have diabetes and your blood sugar levels are high, taking insulin or other prescribed medications as directed by your healthcare provider is crucial.{'\n\n'}
2. Hydration: Drinking water or other non-caloric, non-caffeinated beverages can help flush out excess glucose through urine and help alleviate symptoms.{'\n\n'}
3. Physical Activity: Light physical activity, such as walking, can help lower blood sugar levels by stimulating glucose uptake by muscles.{'\n\n'}
4. Monitoring**: Regularly monitor your blood sugar levels to track the effectiveness of interventions and ensure they are returning to a safe range.{'\n\n'}
5. Avoid High-Carb Foods: Avoid consuming high-carbohydrate foods or drinks, as these can further elevate blood sugar levels.{'\n\n'}

                  </Text>
                  </View>
                )}
                {selectedOption=='regular' && (
                  <ScrollView className="h-44">
                
                  <Text>
                    
                  1. Non-Starchy Vegetables:
   - Examples: Leafy greens (spinach, kale, lettuce), broccoli, cauliflower, bell peppers, zucchini, cucumber.
   - These are high in fiber and low in carbohydrates, helping to stabilize blood sugar levels.{'\n\n'}

2. Whole Grains:
   - Examples: Quinoa, oats, barley, brown rice, whole wheat bread (in moderation).
   - These grains have a lower glycemic index compared to refined grains and provide more fiber and nutrients.{'\n\n'}

3. Lean Proteins:
   - Examples: Skinless poultry, fish, tofu, legumes (lentils, chickpeas, black beans), low-fat dairy products (Greek yogurt, cottage cheese).
   - Protein helps slow down the absorption of carbohydrates and can aid in blood sugar control.{'\n\n'}

4. Healthy Fats:
   - Examples: Avocado, nuts (almonds, walnuts), seeds (chia seeds, flaxseeds), olive oil.
   - Healthy fats contribute to satiety and can help improve insulin sensitivity.{'\n\n'}

5. Fruits:
   - Examples: Berries (strawberries, blueberries, raspberries), apples, citrus fruits (oranges, grapefruits).
   - These fruits are lower in sugar compared to tropical fruits like bananas and mangoes. Moderation is key due to their natural sugars.{'\n\n'}

6. Dairy Products:
   - Examples: Low-fat or fat-free options like Greek yogurt, skim milk.
   - These provide calcium and protein without excessive amounts of carbohydrates.{'\n\n'}

7. Herbs and Spices:
   - Examples: Cinnamon, turmeric, garlic, ginger.
   - Some spices like cinnamon may help improve insulin sensitivity.{'\n\n'}



                  </Text>
                  </ScrollView>
                )}
                <View className="flex flex-row items-end absolute bottom-12 ">
                  <TouchableOpacity  className="bg-teal-500 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                    <Text className="text-white">Tips</Text></TouchableOpacity> 
                  <TouchableOpacity className="bg-slate-100 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                  <Text className="text-teal-500">Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-neutral-950 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                  <Text className="text-white">Tips</Text>
                  </TouchableOpacity>
                </View>
              </View>
              ):(
              <View className="h-full">
                <Text className="font-bold mb-5">Recommended diet</Text>
                {selectedOption=='immediate' && (
                  <View>
                
                  <Text>
                    
1. Glucose Tablets or Gel: Specifically designed for quickly raising blood sugar.{'\n\n'}
2. Fruit Juice: 4 ounces (half a cup) of orange, apple, or grape juice.{'\n\n'}
3. Regular Soda: 4 to 6 ounces (not diet soda).{'\n\n'}
4. Honey or Syrup: 1 tablespoon of honey, corn syrup, or sugar dissolved in water.{'\n\n'}
5. Hard Candy: About 3 to 4 pieces, such as lifesavers or jelly beans.{'\n\n'}
6. Raisins: A small box (about 2 tablespoons).{'\n\n'}
7. Sugar: 1 tablespoon dissolved in water.{'\n\n'}
8. Milk: 1 cup.

                  </Text>
                  </View>
                )}
                {selectedOption=='regular' && (
                  <View>
                
                  <Text>
                    
                  1. High-Fiber Foods{'\n\n'}
- Whole Grains: Brown rice, quinoa, oats, and whole grain bread.{'\n\n'}
- Legumes: Lentils, chickpeas, and black beans.{'\n\n'}
- Fruits and Vegetables: Apples, berries, broccoli, and leafy greens.{'\n\n'}

2. Protein-Rich Foods{'\n\n'}
- Nuts and Seeds: Almonds, chia seeds, flaxseeds.{'\n\n'}
- Dairy or Dairy Alternatives: Greek yogurt, unsweetened almond milk.{'\n\n'}
- Soy Products: Tofu and tempeh.{'\n\n'}

3. Healthy Fats{'\n\n'}
- Avocado: Provides fiber and healthy fats.{'\n\n'}
- Olive Oil: Use in cooking or salads.{'\n\n'}
- Nuts and Nut Butters: Almond butter, peanut butter (without added sugar).{'\n\n'}



                  </Text>
                  </View>
                )}
                    
                <View className="flex flex-row items-end absolute bottom-12 ">
                  <TouchableOpacity  className="bg-teal-500 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                    <Text className="text-white">Tips</Text></TouchableOpacity> 
                  <TouchableOpacity className="bg-slate-100 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                  <Text className="text-teal-500">Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-neutral-950 w-28 h-12 rounded-md flex items-center justify-center ml-2 mr-2">
                  <Text className="text-white">Tips</Text>
                  </TouchableOpacity>
                </View>
               
                
              </View>
              )}
              
            </View>
             </ImageBackground>
    
    )
  
}
const styles = StyleSheet.create({
    roundedTop: {
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
    },
  });
export default ResultsScreen;