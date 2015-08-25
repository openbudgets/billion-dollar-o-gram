var container = document.getElementById("main")

var scale = d3.scale.linear()
                    .domain([40000000, 10000000000])
                    .range([40, 10000]); // proportional values
                    //.range([300, 10000]);
var margin = {top: 40, right: 10, bottom: 10, left: 10};
var width = container.offsetWidth < 800 ? container.offsetWidth : 800;
var height = container.offsetHeight;

var color = d3.scale.category20c();

var pymChild = null;


// HELPER FUNCTIONS

// Get language from GET params, if specified, otherwise default to English
// https://stackoverflow.com/a/21210643
var queryDict = {}
location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
var lang = ""
if (queryDict.lang) {
  lang = queryDict.lang;
}

// Set location of data file based on language
var datafile = "./data/data.json"
if (lang) {
  datafile = "./data/data-" + lang + ".json";
}

function formatAmount(amount, i18n) {
    // Return amount with proper thousands separator according to i18n setting
    // http://blog.tompawlak.org/number-currency-formatting-javascript
    return amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + i18n.thousands_separator) + " €";
}

function formatVerboseAmount(amount, i18n) {
    // Return human-readable amount, with "millions" suffix if applicable
    if (amount / 1000000 > 1) {
      m_amount = Math.round(amount / 1000000);
      m_amount = m_amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + i18n.thousands_separator);
      return m_amount + " " + i18n.millions + " €";
    } else {
      return formatAmount(amount, i18n);
    }
}


function getNodeById(node_obj, id) {
  // Gets a node by its id number, node_obj is a D3 selection containing all nodes
  result = node_obj.filter(function(n) { return n.id == id })[0][0];
  return result;
}

function getSubnodeDims(subnode, nodes) {
  // Calculates dimensions (width and height) for a single subnode based on its amount.
  node = getNodeById(nodes, subnode['parent']);
  parent_w = node.offsetWidth;
  parent_h = node.offsetHeight;
  ratio = subnode.amount / node.__data__.amount;
  if (parent_w > parent_h) {
    // horizontal node
    subnode_h = Math.round(parent_h - 10);
    
    subnode_w = Math.round(parent_w * ratio);
    if (subnode_w < 50) { subnode_w = 50; }
  }
  else {
    // vertical node
    subnode_w = Math.round(parent_w - 10);
    subnode_h = Math.round(parent_h * ratio);
    if (subnode_h < 40) { subnode_h = 40; }
  }
  return [subnode_w, subnode_h];
}

function getModalContent(node, i18n) {
    // Generate the HTML to be placed inside a node's modal dialog.
    contents = "";
    contents += '<h3 class="amount">' + formatAmount(node.amount, i18n) + '</h3>';
    contents += '<ul class="tags">';
    if (node.tags) {
      for (i = 0; i < node.tags.length; ++i) {
        contents += '<li>' + node.tags[i] + '</li>';
      }
    }
    contents += '</ul>';
    contents += marked(node.text);
    return contents;
}

function position() {
  // Called on every element redraw to determine its position
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}


// Set up the treemap
var treemap = d3.layout.treemap()
    .size([width, height])
    .ratio(0.4)
    .sticky(true)
    .sort(function comparator(a, b) { return b.amount - a.amount; })
    .value(function(d) { return scale(d.amount); });


function drawTreemap() {
    // Main draw function. Gets called on each redraw.




    width = container.offsetWidth < 800 ? container.offsetWidth : 800;
    height = container.offsetHeight;

    treemap.size([width, height]);

    // Remove existing containers
    d3.select('#treemap-container').remove();
    d3.select('#modals-container').remove();

    // Add the treemap container div
    var div = d3.select("#main").append("div")
        .style("position", "relative")
        .style("width", width + "px")
        .style("height", height + "px")
        //.style("width", (width + margin.left + margin.right) + "px")
        //.style("height", (height + margin.top + margin.bottom) + "px")
        .attr("id", "treemap-container");
    // Add the modals container div
    var modals = d3.select("body").append("div")
        .attr("id", "modals-container");

    // Populate the treemap
    d3.json(datafile, function (error, data) {
      var node = div.datum(data).selectAll(".node")
            .data(treemap.nodes)
          .enter().append("div")
            .attr("class", "node")
            .attr("data-toggle", "modal")
            .attr("data-target", function(d) { return "#modal-" + d.id; })
            .call(position)
            .style("background", function(d) { return d.color; });

      // Set titles according to language
      $(document).prop("title", data.i18n.title + ": " + data.i18n.subtitle);
      $('#title').html(data.i18n.title + ": <em>" + data.i18n.subtitle + "</em>");

      // Hide the root node
      node.filter(function(d) { return d.title == "root"; }).style("display", "none").style("visibility", "hidden");
      // Each node div contains a node-contents div, which itself
      // contains the title, amount and subnodes
      contents = node.append("div")
        .attr("class", "node-contents");
      contents_text = contents.append("p")
        .attr("class", "node-details")
      contents_text.append("span") // amount
        .attr("class", "node-amount")
        .text(function(d) { return d.amount ? formatVerboseAmount(d.amount, data.i18n) : null });
      contents_text.append("span") // title
        .attr("class", "node-title")
        .text(function(d) { return d.title; });

      // Create the hidden dialog divs
      var dialog = modals.datum(data).selectAll(".modal")
            .data(treemap.nodes)
          .enter().append("div") // Modal dialog
            .attr("id", function(d) { return "modal-" + d.id; })
            .attr("class", "modal fade")
            .attr("tabindex", "-1")
            .attr("role", "dialog")
            .attr("aria-labelledby", function(d) { return "modal-" + d.id + "-label" })
            .attr("aria-hidden", "true");
      modal = dialog.append("div").attr("class", "modal-dialog modal-sm")
                    .append("div").attr("class", "modal-content");
      modalheader = modal.append("div").attr("class", "modal-header");
      modalheader.append("button")
                 .attr("type", "button")
                 .attr("class", "close")
                 .attr("data-dismiss", "modal")
                 .attr("aria-label", "Close")
                 .html(function(d) { return '<span aria-hidden="true">&times;</span>'; });
      modalheader.append("h2")
                 .attr("class", "modal-title")
                 .attr("id", function(d) { return "modal-" + d.id + "-label"; })
                 .text(function(d) { return d.title });
      modalbody = modal.append("div").attr("class", "modal-body");
      modalbody.html(function(d) { return d.text ? getModalContent(d, data.i18n) : null; });

      var subnodes = node.each( function(d) {
        // Only care about nodes that have children
        if (d.subnodes) {
          n = d3.select(this).select(".node-contents").selectAll(".subnode")
              .data(d.subnodes)
            .enter().append("div")
              .style("width", function(d) { return getSubnodeDims(d, node)[0] + "px"; })
              .style("height", function(d) { return getSubnodeDims(d, node)[1] + "px"; })
              .attr("class", "subnode")
              .attr("data-toggle", "modal")
              .attr("id", function(d) { return "subnode-" + d.id; })
              .call(position);

          // Add their titles and amounts
          contents = n.append("p")
            .attr("class", "subnode-details");
          contents.append("span")
            .attr("class", "subnode-amount")
            .text(function(s) { return formatVerboseAmount(s.amount, data.i18n); });
          contents.append("span")
            .attr("class", "subnode-title")
            .text(function(s) { return s.title; });

          // Attach the dialogs to each subnode
          $.each(d.subnodes, function(i) {
            s = d.subnodes[i];

            var subdialog = modals.append("div") // Modal dialog
            .attr("id", function(x) { return "modal-" + s.id; })
            .attr("class", "modal fade")
            .attr("tabindex", "-1")
            .attr("role", "dialog")
            .attr("aria-labelledby", function(x) { return "modal-" + s.id + "-label" })
            .attr("aria-hidden", "true");

            modal = subdialog.append("div").attr("class", "modal-dialog modal-sm")
                          .append("div").attr("class", "modal-content");
            modalheader = modal.append("div").attr("class", "modal-header");
            modalheader.append("button")
                       .attr("type", "button")
                       .attr("class", "close")
                       .attr("data-dismiss", "modal")
                       .attr("aria-label", "Close")
                       .html(function(x) { return '<span aria-hidden="true">&times;</span>'; });
            modalheader.append("h2")
                       .attr("class", "modal-title")
                       .attr("id", function(d) { return "modal-" + s.id + "-label"; })
                       .text(function(x) { return s.title });
            modalbody = modal.append("div").attr("class", "modal-body");
            modalbody.html(function(x) { return s.text ? getModalContent(s, data.i18n) : null; });
          });
          // Override Bootstrap's handling of subnode clicks
          n.on("click", function(d, i) { $('#modal-' + d.id).modal(); d3.event.stopPropagation(); });
        }
      });

      // Redistribute treemap elements on data change
      d3.selectAll("input").on("change", function change() {
        var value = this.value === "count"
            ? function() { return 1; }
            : function(d) { return scale(d.amount); };

        node
            .data(treemap.value(value).nodes)
          .transition()
            .duration(1500)
            .call(position);
      });
    });




    if (pymChild) {
        pymChild.sendHeight();
    }

}

drawTreemap();

// Redraw on resize
d3.select(window).on('resize', resize);

function resize() {
  width = container.clientWidth,
  height = container.clientHeight;
  drawTreemap();
}


$(window).load(function() {
    // This is instantiating the child message with a callback but AFTER the D3 charts are drawn.
    pymChild = new pym.Child({ renderCallback: drawTreemap });

});


