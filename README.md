#PIE BAR MULTI graph
Creates multiple grouped bar graphs and a pie chart

#STEPS TO USE THE LIBRARY-
1. Create a container div and give it an id

2. Include pie-bar-multi-graph.js and pie-bar-multi-graph.css in your index file, after importing bootstrap.min.css and d3.min.js

3. Create a configuration object, dummy object is given below-
	config = {
			width: 800, 				//width of the entire container
			height: 350, 				//height of the entire container
			valueProp: 'value',			//Object property under which numeric value is stored
			labelProp: 'name',			//Object property to be shown as label in legend
			subProp: 'categories',		//Property under which inner object is stored
			id: '#graph-chart',			//Id of the container element
			ratio: 0.7, 				//(Optional) Ratio of bar graph width to total 'width' (default: 0.5)
			marginV: 30,				//(Optional) Vertical margin inside the containing element (default: 30)
			textOffsetHeight: 10		// (Optional) Height between bottom of bar graph and bar graph group label (default: 30)
		}

4. Instantiate multiGraphChart function and pass in the config and data object

IMPORTANT POINTS-
1. Names should be same for label and value properties for both inner and outer object
2. Object at level one will be shown in pie chart, second level will be shown as bar group label and third level will be used to populate bar graph.
3. You have to manually pass in the total of 'config.valueProp' of all sub Objects inside 'config.subProp' in the outermost object

NOTE- config.labelProp in third level will be displayed as individual bar label and on second level will be displayed as bar group label.

NOTE- Pass all the numeric values as number and not as string
