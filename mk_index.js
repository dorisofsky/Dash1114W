    $(function() {　
      $(window).load(function() {　　
        $(window).bind('scroll resize', function() {　　
          var $this = $(this);　　
          var $this_Top = $this.scrollTop();　　
          //當高度小於100時，關閉區塊
          　　
          if ($this_Top < 80) {　　　
            $('#top-bar').stop().animate({
              top: "0px"
            });　　　
          }　　　　
          if ($this_Top > 80) {　　　　
            $('#top-bar').stop().animate({
              top: "0px"
            });　　　
          }　　
        }).scroll();　
      });
    });

    $(function() {
      $("#gotop").click(function() {
        jQuery("html,body").animate({
          scrollTop: 0
        }, 1000);
      });
      $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
          $('#gotop').fadeIn("fast");
        } else {
          $('#gotop').stop().fadeOut("fast");
        }
      });
    });
    $(document).ready(function() {
      draw()
    });


var button1, ndx;

    function draw() {


      var csv = d3.dsv(",", "text/csv;charset=big5");
      csv("nfa3.csv", function(error,data) {

//時間這邊有新增(以下)
        var timeAllparse = d3.time.format("%Y-%m-%e %H:%M").parse, 
            dateformat = d3.time.format("%Y/%m/%d"), 
            timeformat = d3.time.format("%H:%M"); 

        data.forEach(function(d){
            d.parseTime=timeAllparse(d.Time);
            d.date=dateformat(d.parseTime); 
            d.tt=timeformat(d.parseTime); 
        });
//時間這邊有新增(以上)


        ndx = crossfilter(data);
        var townId = ndx.dimension(function(d) { return d["TOWN_ID"]; });
     
        var facilities = ndx.dimension(function(d) { return d["geo"]; });
        var facilitiesGroup = facilities.group().reduceCount();
        var disastertypes = ndx.dimension(function(d){return d["disastertype"];});
        var disastertypesGroup = disastertypes.group().reduceCount();
        //以下有修改
        var hourdim = ndx.dimension(function(d) { return d3.time.hour(d.parseTime); });  
        var timedim = ndx.dimension(function(d){return d.parseTime;});
        var FloodGroup = hourdim.group().reduceSum(function(d){return d.Flood;});
        var LandslideGroup = hourdim.group().reduceSum(function(d){return d.Landslide;});
        var TrafficGroup = hourdim.group().reduceSum(function(d){return d.Traffic;});
        //以上有修改
        var countyDim  = ndx.dimension(function(d) {return d["C_Name"];});
        var county_Disasters = countyDim.group().reduceCount(function(d){return d.Flood+d.Landslide+d.Traffic;});

        var colorScale = d3.scale.ordinal().domain(["Flood", "Landslide", "Traffic", "Flood&Landslide", "Flood&Traffic", "Traffic&Landslide", "Flood&Traffic&Landslide"])
                                           .range(["#14999e", "#ECA400", "#E85F5C","#999999","#999999","#999999","#999999"]);

        //新增minTime、maxTime
        var minTime = timedim.bottom(1)[0].parseTime;
        var maxTime = timedim.top(1)[0].parseTime;


        var MKmarker = dc_leaflet.markerChart("#map")
          .dimension(facilities)
          .group(facilitiesGroup)
          .width(380)
          .height(400)
          .center([23.5, 121])
          .zoom(7)
          .cluster(true)
          .renderPopup(false)
          .filterByArea(true);

        var pie = dc.pieChart("#dis_pie")
          .dimension(disastertypes)
          .group(disastertypesGroup)
          .colors(function(disastertype) {
            return colorScale(disastertype);
          })
          .width(200)
          .height(200)
          .renderLabel(true)
          .renderTitle(true)
          .cap(7)
          .ordering(function(d) {
            return disastertypesGroup;
          });

        var countyRowChart = dc.rowChart("#chart-row-county")
        .width(380)
          .height(220)
          .margins({
            top: 20,
            left: 55,
            right: 0,
            bottom: 20
          })
          .dimension(countyDim)
          .group(county_Disasters, "Disasters")
          .labelOffsetX(-45)
          .colors(d3.scale.category10())
          .elasticX(true)
          .controlsUseVisibility(true)
          .ordering(function(d) {
            return countyDim;
          })
          .rowsCap(5);

        var all = ndx.groupAll();
       
        var filterCount = dc.dataCount('.filter-count')
          .dimension(ndx)
          .group(all)
          .html({
            some: '%filter-count'
          });

        var totalCount = dc.dataCount('.total-count')
          .dimension(ndx)
          .group(all)
          .html({
            some: '/%total-count'
          });

        //timechart已修改
        var timechart =dc.barChart("#dis_time")
            .width(770)
            .height(250)
            .transitionDuration(500)
            .margins({top: 7, right: 0, bottom: 47, left: 55})
            .dimension(hourdim)
            .group(FloodGroup,"Flood")
            .stack(LandslideGroup,"Landslide")
            .stack(TrafficGroup,"Traffic")
            .colors(function(disastertype){ return colorScale(disastertype); })
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .mouseZoomable(false)
            .x(d3.time.scale().domain([minTime, maxTime]))
            .xAxisLabel("Date")
            .centerBar(true)
            .xUnits(function(d){return 70})
            .brushOn(true)
            .xAxis().tickFormat(d3.time.format('%m/%d %H:%M'));

         var dataTable = dc.dataTable('#dc-table-graph')
            .width(680)
            .dimension(townId)
            .group(function (d) {return d.date; })
            .size(Infinity)
            .columns([
                function(d){ return d.C_Name;},
                function(d){ return d.T_Name;},
                function(d){ return d.date;}, //修改
                function(d){ return d.tt;}, //修改
                function(d){ return d.disastertype;},
                function(d){ return d.situation;},
              ])
            .sortBy(function(d){
                return d.parseTime; //修改
              })
            .order(d3.ascending);

        dc.renderAll();
      });

function load_button(file) {
    return function load_it() {
        csv(file, function(error,data) {
            ndx.remove();
            ndx.add(data);
            dc.redrawAll();
        });
    };
}

button1 = load_button("./Morakot/typhoondata.csv");
   

    }


