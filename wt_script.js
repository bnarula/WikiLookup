var wt_comp;
var apiEndpoint = "https://"+chrome.i18n.getMessage("apiEndpoint")+".wikipedia.org/w/api.php";

if(!wt_comp)
{
	wt_comp = createWikiDiv();
	wt_comp.view.appendTo($("body"));
	setupContextMenu();
}
function setupContextMenu(){
	var createProperties = {
		title: chrome.i18n.getMessage("ctxt_menu_item_lookup"),
		onclick: callback,
		enabled: false,

	};
	var callback = function(){
		
	}
	//chrome.contextMenus.create(createProperties, callback);
}
function getSelectedText(event) {
	if(event.altKey && document.getSelection().toString()!=""){
		if(wt_comp.state != 'shown'){
			
			wt_comp.view.css('visibility', 'visible');
			wt_comp.view.css('width', '300px');
			wt_comp.state = 'shown';
		}
		hitWiki((document.all) ? document.selection.createRange().text : document.getSelection());
	}	  
}

function closeWikiCard(){
	
	wt_comp.view.css('width', '0px');
	wt_comp.view.css('visibility', 'hidden');
	var card = wt_comp.elements[0];
			
	card.elements[0].view.text('..title..');
	var img = card.elements[1];
	
	img.view.attr('src' , '');
		
	card.elements[2].view.html('....');
	card.elements[4].view.attr('href', 'https://en.wikipedia.org/wiki/Main_Page');
	wt_comp.state = 'hidden';		
}

function hitWiki(wtSelText){
	if(wtSelText.rangeCount){
		var promiseCall = function(resolve, reject) {
		  $.ajax({
				  url: apiEndpoint,
				  async : true,
				  data: {
						"action": "query",
						"format": "json",
						"prop": "extracts|pageimages|info",
						"inprop":"url",
						"titles": wtSelText.toString().trim(),
						"formatversion": "2",
						//"exsentences": "3",
						"exsectionformat":"plain",
						//"explaintext": 1,
						"piprop": "thumbnail",
						"pithumbsize": "300",
					},
				  success: function (x) {
						resolve(x);
				  }
				});
		};
		var promise = new Promise(promiseCall);
		
		promise.then(function(x) {
			
			if(!x.query)
				return;	
			var card = wt_comp.elements[0];
			
			card.elements[0].view.text(x.query.pages[0].title);
			var img = card.elements[1];
			if(x.query.pages[0].thumbnail){
				img.view.attr('src' , x.query.pages[0].thumbnail.source);
			} else {
				img.view.attr('src' , chrome.runtime.getURL("ic_image_black_48px.svg"));
			}
			var extract = x.query.pages[0].extract;
			if(extract === '' || !extract)
			{	
				extract = 'Wikipedia does not have anything on this topic.'
				if(x.query.pages[0].fullurl){
					extract += '\nUse <a href=\"'+x.query.pages[0].fullurl+'\" 	target=\"_blank\" style=\"color:blue\" >this link </a> to check more.';
				}
				
				card.elements[2].view.css('color', 'red');
			} else {
				card.elements[2].view.css('color', '#000');
			}
			card.elements[2].view.html(extract);
			card.elements[4].view.attr('href', x.query.pages[0].fullurl);
			
		}, function(err) {
		  console.log(err); // Error: "It broke"
		});
		
		
	}
	
}
document.onmouseup = getSelectedText;
document.ondblclick = getSelectedText;


function createWikiDiv(){
	var comp = {};
	comp.view = $("<div class=\"wt_wrapper\" id=\"wt_card\"></div>");
	comp.view.height($(window).height() - 5);
	comp.elements = [];
	comp.state = 'drawn';
	var card = {};
	card.view = $('<div class=\"wt_card-block\"> </div>');
	card.elements = [];
		
	var title = {};
	title.view = $('<h4 class=\"wt_card-title\" id=\"wt_title\">..Title..</h4>');
	title.view.appendTo(card.view);
	card.elements.push(title);

	
	$('<hr />').appendTo(card.view);

	var img = {};
	var noImage = chrome.runtime.getURL("ic_image_black_48px.svg");
	img.view = $('<img class=\"wt_card-img-top\" id=\"wt_img\" src=\"'+noImage+'">');
	img.view.appendTo(card.view);
	//img.view.wrap('<center></center>');
	card.elements.push(img);
	
	$('<hr />').appendTo(card.view);

	var desc = {};
	desc.view = $('<p class=\"wt_card-text wt_extract\" id=\"wt_extract\"></p>');
	desc.view.appendTo(card.view);
	card.elements.push(desc);
	
	var bClose = {};
	var closeIcon = chrome.runtime.getURL("ic_close_black_24dp_2x.png");
	bClose.view = $('<img class=\"wt_close-button\" src=\"'+closeIcon+'\"></img>');
	bClose.view.on('click', closeWikiCard);
	bClose.view.appendTo(card.view);
	card.elements.push(bClose);
	
	var bLink = {};
	var newIcon = chrome.runtime.getURL("ic_open_in_new_black_24dp_2x.png");
	bLink.view = $('<a class=\"wt_link-button\" title=\"Open this in Wikipedia\" target=\"_blank\"><img src=\"'+newIcon+'\" class=\"wt_link-img\" /></a>');
	bLink.view.appendTo(card.view);
	card.elements.push(bLink);
	
	comp.elements.push(card);
	card.view.appendTo(comp.view);
	
	return comp;
	
}
