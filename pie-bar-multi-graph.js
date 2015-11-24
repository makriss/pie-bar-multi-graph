multiGraphChart = function(config, obj){
	var duration = 500;
	var self = this;
	var marginV = config.marginV?config.marginV:30;
	var marginH = config.marginH?config.marginH:0;
	var ratio = config.ratio?config.ratio:0.5;
	this.totalObj = [];
	var totalHeight = config.height - 2*(marginV);
	var totalWidth = config.width - 2*(marginH);
	var textOffset = config.textOffsetHeight || 30;
	var barGraphWidth = ratio*totalWidth; //width assigned to bar graph svg element
	var pieWidth = totalWidth - barGraphWidth;	// width assigned to pie chart svg element
	var barColor = 'steelblue';
	var groupScaleProp = 'id';
	// creates a linear scale to scale down(up) bar's height in accordance to container's height
	var y = d3.scale.linear()
			.range([totalHeight-textOffset,0]);

	//calculates overall bar graph width
	var x = d3.scale.ordinal()
    			.rangeRoundBands([0, barGraphWidth], .1);

	// Scale to compute width inside a bar group
	var x2 = d3.scale.ordinal();

	// x axis of the bar graph
	var xAxis = d3.svg.axis()
					.scale(x)
					.orient('bottom');
	// pie layout
	var pieLayout = d3.layout.pie()
						.value(function(d){ return d[config.valueProp] });
	// scale for color's of pie chart
	var pieColor = d3.scale.ordinal()
						.range(["#807dba","#e08214","#41ab5d",'#2ca02c', '#d62728']);

	function init(){
		var container = d3.select(config.id);
		//svg container for bar graph
		self.chart = container.append('svg')
						.attr('id','graph-chart-svg')
						.attr('width', barGraphWidth)
						.attr('height', config.height)
						.append('g')
						.attr('transform', "translate("+marginH+","+marginV+")");

		self.barGroup = self.chart.append('g')
							.attr('transform', "translate(0,0)");
		self.bottomLabelGroup = self.chart.append('g')
									.attr('transform', "translate(0,"+(totalHeight-textOffset)+")");

		//creating svg container for pie chart
		self.pieGroup = container.append('svg')
							.attr('id', 'pie-chart-svg')
							.attr('x', barGraphWidth)
							.attr('height',totalHeight)
							.attr('width', pieWidth)
							.append('g')
							.attr('transform', "translate("+pieWidth/2+","+(totalHeight/2)+")");

		self.totalObj = calculateGraphTotal(obj);

		//creating a table container for legend
		self.legendGroup = container.append('div')
									.attr('id','legend-table')
									.append('table')
									.attr('class','legend');
	}

	//Runs first time and creates an object having the total of
	// values under config.subLabel
	function calculateGraphTotal(data){
		self.keys = {};
		var temp = {};
		var total = 0;
		for(var i in data){
			if(data.hasOwnProperty(i)){
				var sub = data[i][config.subProp];
				sub.forEach(function(s){ //Inside second level
					var parentName = s[config.labelProp];
					if(!temp[parentName]) temp[parentName] = {}; // Creating parent property as in original structure
					s[config.subProp].forEach(function(item,index){ //Inside third level
						self.keys[index] = true;
						if(!temp[parentName][item[config.labelProp]]) temp[parentName][item[config.labelProp]] = 0;
						temp[parentName][item[config.labelProp]]+=item[config.valueProp];
					})
				})
				total+=data[i][config.valueProp];
			}
		}
//		console.log(JSON.parse(JSON.stringify(temp)));
		var arr = [];
		//adding a 'percent' property to passed in data
		for(var i in data){
			if(data.hasOwnProperty(i)){
				data[i]['percent'] = Math.round(data[i][config.valueProp]/total*100);
			}
		}
		self.keys = Object.keys(self.keys);

		for(var sub in temp){
			if(temp.hasOwnProperty(sub)){
				var parent = {};
				parent[config.labelProp] = sub;
				var a = [];
				// if(!self.keys) self.keys = Object.keys(temp[sub]);
				for(var t in temp[sub]){
					if(temp[sub].hasOwnProperty(t)){
						var buffer = {};
						buffer[config.labelProp] = t;
						buffer[config.valueProp] = temp[sub][t];
						a.push(buffer);
					}
				}
				parent[config.subProp] = a;
			}
			arr.push(parent);
		}
//		console.log(JSON.parse(JSON.stringify(arr)));
		return arr;	//returns an array of object having all groups with numbers added up
	}

	function createChart(data){
		createBarGraph(self.totalObj);
		createPieChart(data);
		createLegend(data);
	}

	function createBarGraph(data){
		x.domain(data.map(function(d) { return d[config.labelProp]; })); //Setting domain for overall x scale
		// x2 scale's width is mapped to index of array+1
		x2.domain(self.keys.map(function(d,i){ return i+1; })).rangeRoundBands([0,x.rangeBand()],.1);
		y.domain([0, d3.max(data, function(d){
			return d3.max(d[config.subProp], function(ds){ return ds[config.valueProp] });
		})]);
		window.y = y;
		self.chart.select('g.x.axis').remove('*');
		var bar = self.barGroup.selectAll('g')
					.data(data);
		var barEnter = bar.enter().append('g');

		bar.attr('class', 'bar')
			.attr('transform', function(d,i){
				return "translate("+x(d[config.labelProp])+",0)";
			});

		// create's bars based on data
		bar.selectAll('rect')
			.data(function(d){ return d[config.subProp]; })
			.enter().append('rect')
			.attr('x', function(d,i){ return x2(i+1); })
			.attr('y', function(d){ return y(d[config.valueProp]); })
			.attr('width', x2.rangeBand())
			.attr('height', function(d){ return totalHeight - textOffset  -y(d[config.valueProp]); })
			.attr('fill',barColor)

		// creates text field above each bar
		bar.selectAll("text")
			.data(function(d){ return d[config.subProp]; })
			.enter().append('text')
			.attr('x', function(d,i){
				var r = x2(i+1) + x2.rangeBand()/2;
				return r;
			})
			.attr("y", function(d) { return y(d[config.valueProp]) - 3; })
			.attr('text-anchor', 'middle')
			.text(function(d) { return d[config.valueProp]; });

		bar.exit().remove();

		//Adding bottom labels for individual bars
		var labels = self.bottomLabelGroup.selectAll('g')
						.data(data);
		labels.enter().append('g')
				.attr('transform', function(d,i){
				return "translate("+x(d[config.labelProp])+",0)";
			});

		labels.selectAll('text')
			.data(function(d){ return d[config.subProp]; })
			.enter().append('text')
			.attr('x', function(d,i){ return x2(i+1) + x2.rangeBand()/2; })
			.attr("y", function(d) { return 12; })
			.attr('text-anchor', 'middle')
			// .text(function(d){ return d[config.labelProp]; })
			.each(wrapText);

		//Adding horizontal axis labelling each bar group
		self.chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + totalHeight + ")")
			.call(xAxis)
			.selectAll('#graph-chart .x.axis .tick text')
			.style({'font-size': '12px'})
	}

	function wrapText(d,index) {
		index++;
	   var arr = d.name.split(" ");
	   if (arr != undefined) {
		   for (i = 0; i < arr.length; i++) {
			   d3.select(this).append("tspan")
				   .text(arr[i])
				   .attr("dy", i ? "1.2em" : 0)
				   .attr('x', function(d){ return x2(index) + x2.rangeBand()/2; })						   .attr("text-anchor", "middle")
				   .attr("class", "tspan" + i);
		   }
	   }
	}

	function updateBarGraph(data, color){
		y.domain([0, d3.max(data, function(d){
			return d3.max(d[config.subProp], function(ds){ return ds[config.valueProp] });
		})]);

		var bars = self.barGroup.selectAll('g')
						.data(data);
		var b = bars.selectAll("rect")
				.data(function(d){ return d[config.subProp]; });
		b.enter().append('rect');
		b.transition().duration(duration)
			.attr("y", function(d) {return y(d[config.valueProp]); })
			.attr("height", function(d) { return totalHeight - textOffset -y(d[config.valueProp]); })
			.attr("fill",color)

		// transition the frequency labels location and change value.
		var text = bars.selectAll("text")
					.data(function(d){ return d[config.subProp]; });
		text.enter().append('text');
		text.transition().duration(duration)
			.text(function(d){ return (d[config.valueProp])})
			.attr("y", function(d) {return y(d[config.valueProp])-3; });
	}

	function createPieChart(data){
		var oRadius = Math.min(totalHeight, pieWidth)/2;
		var arc = d3.svg.arc()
					.innerRadius(0)
					.outerRadius(oRadius-20);
		var piePath = self.pieGroup.selectAll('path')
						.data(pieLayout(data), function(d){ return d.data.id; })
		piePath.enter().append('path');
		piePath.attr('fill', function(d){ return pieColor(d.data['id']);})
				.attr('stroke', 'white')
				.attr('stroke-width', 0.7)
				.attr('d', arc)
				.on('mouseenter', mouseEnter)
				.on('mouseleave', mouseLeave)

		piePath.exit().remove();
	}

	function createLegend(data){
		var tBody = self.legendGroup.append('tbody');
		var tr = tBody.selectAll('tr')
					.data(data)
					.enter()
					.append('tr');

		tr.append('td').append('svg').attr("width", '16').attr("height", '16')
			.append("rect").attr("width", '16').attr("height", '16')
			.attr('fill',function(d){
				return pieColor(d['id']);
			});
		tr.append('td').html(function(d){return d[config.labelProp]});
		// tr.append('td').html(function(d){return d[config.valueProp]});
		// tr.append('td').html(function(d){return d['percent']+'%';});
	}

	function mouseEnter(d){
		var color = d3.select(this)
			.attr('fill');
		updateBarGraph(d.data[config.subProp], color);
	}

	function mouseLeave(d){
		updateBarGraph(self.totalObj, barColor);
	}

	if(obj && obj.length){
		init();
		createChart(obj);
	}
}
