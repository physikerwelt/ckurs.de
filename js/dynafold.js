//**Achtung geänderte Version***//
// 3. März 2007


//****************************************************************
//*********************     Dyna Fold 1.0    ****************************
//**********************     by F. Kunz    ******************************
//****************************************************************

// Variablendfinitionen (anpassbar)
iconIn="plus.gif"				// Grafik für Ausklappschaltfläche
iconOut="minus.gif"			// Grafik für Einklappschaltfläche
iconPath="../img/"						// Pfad zu den Grafiken
iconClass="foldIcon"		// Diese Klasse fomatiert die Schaltfläche
foldClass="fold"				// Klasse um Ausklappbereiche zu definieren
foldClassSeperator="_"
captionClass="caption"		// Klasse für Überschriften
contentClass="content"	// Klasse für Inhaltsbereiche
visibleContent="visibleContend"
hideClass="hidden"			// Klasse zum Verbergen der content-Bereiche
highlightClass="highlight"	// Klasse für Bookmark Hervorhebung
separator="."					// Separatorzeichen bei automatischer Nummerierung
blinkMax=3						// Blinkanzahl angeklickter Bookmark; 0=ewig blinkend
blinkInterval=1				// Blinklänge in msec

// Schalter
var params=new Array()
params["FOLD_CLASSES"]=1
//  steuert, ob für die gesammten fold Bereiche (umfasst die
// Überschrift mit Button und ein-/ausklappbarer Inhaltsbereich) verschiedene CSS-Klassen 
// gemäss ihrer Verschachtelungstiefe (es werden nur die als Ausklappbereiche definierten
// divs berücksichtigt) verwendet werden. Wenn auf true, müssen die entsprechenden
// Klassen im Stylesheet definiert sein:
//		.fold1: oberste Verschachtelungsebene
//		.fold2: zweitoberste Verschachtelungsebene			usw

params["CAPTION_CLASSES"]=1
// CAPTION_CLASSESES ist analog FOLD_CLASSES für die Überschriften.
// Wenn auf true gesetzt, müssen die entsprechenden Klassen im Stylesheet
// definiert sein:
//		.caption1: Überschrift oberste Verschachtelungsebene
//		.caption2: Überschrift zweitoberste Verschachtelungsebene			usw


params["CONTENT_CLASSES"]=1
// CONTENT_CLASSESES ist analog FOLD_CLASSES für die ein-/ausklappbaren Inhaltsbereiche.
// Wenn auf true gesetzt, müssen die entsprechenden Klassen im Stylesheet
// definiert sein:
//		.content1: oberste Verschachtelungsebene
//		.content2: zweitoberste Verschachtelungsebene			usw

params["AUTO_NUMBER"]=false
// AUTO_NUMBER erzeugt eine automatische Nummerierung der Überschriften
// gemäss ihrer Verschachtelungstiefe, also
//		1.
//		1.1
//		1.1.1
//		1.2
//		1.3
//		1.3.1		usw.

params["OPEN_LEVELS"]="Aufgaben"
// Alle dynamischen Bereiche werden angezeigt, wenn OPEN_LEVELS auf true steht

params["HIGHLIGHT_TARGET"]=true
// Der zuletzt angesprungene Bookmark wird durch Blinken hervorgehoben, wenn dieser Wert auf true gesetzt ist.

params["CAPTION_EVENTS"]=false
// Wenn true, wird die ganze &Uuml;berschrift als Schaltfl&auml;che zum Ein- und Ausklappen betrachtet; sonst nur das +/- Zeichen davor.

params["RUN_ON_START"]=true
// Das Skript wird nur ausgeführt, wenn RUN_ON_START auf true steht. Nur für Demozwecke.


// interne Variablen (dürfen nicht geändert werden)
buttonID="button"
foldID="fold"
captionID="caption"
contentID="content"

foldTree=new Array()
var foldLevel
var blinkObj
var blinkObjClass
var blinkHandle
blinkCount=0
maxDepth=0
foldCount=0

// Knoten für Steuerungsschaltfläche erzeugen
icon=document.createElement("img")
icon.src=iconPath+iconIn

document.onLoad = init()

function init() {
	// Parameter in der URL auswerten
	s=window.location.search
	if (s.length>1){
		ps=s.substr(1).split("&")
		for (i=0; i<ps.length; i++) {
			pos=ps[i].indexOf("=")
			if (pos>0) {
				p=ps[i].substr(0,pos).toUpperCase()
				v=ps[i].substr(pos+1).toLowerCase()
				if (params[p]!=null && (v=="true" || v=="false" || parseInt(v)>=-1)) {params[p]=eval(v)}
			}					
		}
	}
	if (params["RUN_ON_START"] && document.getElementById) {
		loadExtraData(document)
		createFoldTree(document)
		showLevels(params["OPEN_LEVELS"])
		if (document.getElementById("allFolds")) {document.getElementById("allFolds").style.display="block"}
		h=window.location.hash
		if (h.length>1) {
			h=h.substr(1)
			jump(h)
		}
	}
}

//function cleanUp entfernt führende leere Textknoten und Umbrüche im ersten Kindknoten
function cleanUp(obj) {
	// zuerst leere Textknoten, Kommentare und Umbrüche entfernen
	try{while(((obj.firstChild.nodeType==3) && (obj.firstChild.data.search(/\S/)==-1)) || obj.firstChild.nodeType==8 || (obj.firstChild.tagName && obj.firstChild.tagName.toLowerCase()=="br"))	{	
		void (obj.removeChild(obj.firstChild))
	}
	// dann innerhalb des Textes Leerzeichen Umbrüche und Tabs entfernen (primär für Mozilla Browser)
	if (obj.firstChild.nodeType==3) {
		text=obj.firstChild.data
		while (text.charCodeAt(0)<33) {text=text.substr(1)}
		obj.firstChild.data=text
	}}
	catch(e){alert(obj.className+obj.id)}
	finally{
	return (obj)}
}

function loadExtraData(area){
	includes=area.getElementsByTagName("inc");
	for (i=0; i<includes.length; i++) {
		getExtraData(includes[i]);
	}
}

// function createFoldTree ersetzt alle durch fold-Klasse markierten divs durch dynamischen Ausklappbereich
function createFoldTree(area) {
	var strTemp
	var oldFoldCount=foldCount;
	divs=area.getElementsByTagName("div")		// alle divs auswählen
	for (i=0 ; i<divs.length ; i++) {
		 //alert(divs[i].className.substr(0,foldClass.length));
		 if (divs[i].className.substr(0,foldClass.length)==foldClass) {			// fold Bereiche aussortieren
			foldTree[foldTree.length]=divs[i]
		}//*/
	
	}
	
	foldCount=foldTree.length
	foldLevel=new Array(foldCount)
	
	for (i=(foldCount-1) ; i>oldFoldCount -1; i--) {
		
		// Hierarchiestufe und Nummerierung festlegen
		foldLevel[i]=0
		autoNum=""
		pointer=foldTree[i]
		while (pointer.parentNode.tagName.toLowerCase()!="html") {
			num=1
			while (pointer.previousSibling){
				strTmp=pointer.previousSibling.className
				try {if (strTmp.substr(0,foldClass.length)==foldClass) {num++}} catch (e) {}
				pointer=pointer.previousSibling
			}
			autoNum=num+separator+autoNum
			foldLevel[i]++
			pointer=pointer.parentNode
			while (pointer.className!=foldClass && pointer.tagName.toLowerCase()!="body") {pointer=pointer.parentNode}
		}
		autoNum=autoNum.substr(0,autoNum.length-1)+" "
		if (foldLevel[i]> maxDepth) {maxDepth=foldLevel[i]}		// maximale Verschachtelungstiefe ermitteln
		
		// Erzeuge fold Bereich
		content=foldTree[i].cloneNode(true)
		content.setAttribute("id", contentID+i)
		content=cleanUp(content)								// führende leere Textknoten entfernen und Umbrüche vor Überschrift
		a=content.removeChild(content.firstChild)			//Überschrift extrahieren
		content=cleanUp(content)								// führende leere Textknoten entfernen und Umbrüche vor Inhalt

		//Behandlung von Tabellen im Überschriftsbereich
		path=""
		thead=tbody=""
		if (a.tagName && a.tagName.toLowerCase()=="table") {
			table=a.cloneNode(true)
			table=cleanUp(table)
			path="table.firstChild"									// Pfad des Überschriftsknoten relativ zur Tabelle
			obj=eval(path)
			obj=cleanUp(obj)
			if (obj.tagName.toLowerCase()=="caption") {path+=".firstChild"}		// Hat Tabelle eine Überschrift? Diese verwenden
			else {
				while (eval(path)) {
					obj=eval(path)
					if (obj.tagName) {
						switch (obj.tagName.toLowerCase()) {			// Suche <thead> und <tbody>
							case "thead": thead=path; break
							case "tbody": tbody=path; break
						}
					}
					path+=".nextSibling"
				}
				//Überschreibe Pfad mit gefundenen Elementen: <thead> hat höchste Priorität
				if (tbody!="") {path=tbody}
				if (thead!="") {path=thead}
				
				for (j=0; j<3; j++) {				// Zeigt auf: <tr>, <td>, Überschriftselement
					obj=eval(path)
					obj=cleanUp(obj)
					path+=".firstChild"
				}
			}
			a=eval(path).cloneNode(true)
		}
		// Überschrift reiner Textknoten oder Bild oder Objekt (z.B. Flash)?
		if (a.nodeType==3 || a.tagName.toLowerCase()=="img" || a.tagName.toLowerCase()=="object"){		
			caption=document.createElement("span")		// einpacken in span-Knoten
			caption.appendChild(a)
		}
		else {caption=a}
		if (params["AUTO_NUMBER"]) {
			num=document.createTextNode(autoNum)
			caption.insertBefore(num,caption.firstChild)
		}
		caption.setAttribute("id", captionID+i)
		button=icon.cloneNode(true)												// Plus/Minus Schaltfläche erzeugen
		button.setAttribute("id", buttonID+i)
		caption.insertBefore(button, caption.firstChild)

		// Faltbereich erzeugen
		fold=document.createElement("div")
		if (path!="") {												// Tabellen-Pfad?
			eval(path).parentNode.replaceChild(caption,eval(path))		// Überschriftsknoten durch umformatierten ersetzen
			fold.appendChild(table)														// Tabelle in Faltbereich einfügen
		}
		else {fold.appendChild(caption)}											//umformatierte Überschrift in Faltbereich einfügen
		fold.appendChild(content)
		fold.setAttribute("id", foldID+i)

		fold.className=foldTree[i].className
		// Ersetze alten fold Bereich
		foldTree[i].parentNode.replaceChild(fold,foldTree[i])	//div ersetzen
		//alert(foldTree[i].className.substr(foldClass.length,foldClassSeperator.length))
		if(foldTree[i].className.substr(foldClass.length,foldClassSeperator.length)==foldClassSeperator){
			foldLevel[i]=foldTree[i].className.substr(foldID.length)
		}
	}
	
	// Setzte Eventhandler und Klassen
	for (i=oldFoldCount; i<foldCount; i++) {
		//alert(i);
		// Setzte Eventhandler
		if (params["CAPTION_EVENTS"]) {evObj=document.getElementById(captionID+i)}
		else {evObj=document.getElementById(buttonID+i)}
		evObj.style.cursor="pointer"							// Hand-Cursor beim Darüberfahren
		if (document.all) {evObj.onclick=foldHandle}
		else {evObj.addEventListener("click",foldHandle,true)}
		// Setzte Klassen
		//alert(foldLevel[i])
		//alert(document.getElementById(foldID+i).className.substr(foldClass.length,foldClassSeperator.length));
		//if(document.getElementById(foldID+i).className.substr(foldClass.length,foldClassSeperator.length)!=foldClassSeperator){
			if (params["FOLD_CLASSES"]<foldLevel[i] ) {document.getElementById(foldID+i).className=foldClass}
			else {document.getElementById(foldID+i).className=foldClass+foldLevel[i]}
			if (params["CAPTION_CLASSES"]<foldLevel[i]) {document.getElementById(captionID+i).className=captionClass}
			else {document.getElementById(captionID+i).className=captionClass+foldLevel[i]}
		/*}else{
			document.getElementById(captionID+i).className=captionID+document.getElementById(foldID+i).className.substr(foldID.length)
			//document.getElementById(contentID+i).setAttribute(visibleContent)=contentID+document.getElementById(foldID+i).className.substr(foldID.length)
		}*/
		document.getElementById(buttonID+i).className=iconClass
		hideContent(i)
	}
}			


function  foldHandle(e){
	if (document.all) {id=window.event.srcElement.id}
	else {id=e.target.id}
	id=id.match(/\d+/)
	content=document.getElementById(contentID+id)
	if (content.className==hideClass) {showContent(id)}
	else {hideContent(id)}
}

function showContent(i) {
	if (params["RUN_ON_START"]) {
		icon=document.getElementById(buttonID+i)
		content=document.getElementById(contentID+i)
		/*if(content.getAttribute(visibleContend)){
			content.className=content.getAttribute(visibleContend)
		}else{*/
		//alert(foldLevel[parseInt(i)]);
			if (params["CONTENT_CLASSES"]<foldLevel[parseInt(i)]) {content.className=contentClass}
			else {content.className=contentClass+foldLevel[parseInt(i)]}
		//}
		//if (content.firstChild.tagName.toLowerCase()=="inc")
			//	getExtraData(content.firstChild);
		icon.src=iconPath+iconOut
	}
}
	
function hideContent(i) {
	if (params["RUN_ON_START"]) {
		icon=document.getElementById(buttonID+i)
		content=document.getElementById(contentID+i)
		content.className=hideClass
		icon.src=iconPath+iconIn
	}
}

function  showLevels(depth){
	if (foldCount!=0) {
		if (depth===false) {depth=0}
		if (depth===true) {depth=maxDepth}					// alles aufklappen?
		if (depth=="Aufgaben") {
			for (i=0; i<foldCount; i++) {
				if ((foldLevel[i]!=foldClassSeperator+"Antwort")) {showContent(i)} //nicht ändern Fehler 
				else {hideContent(i)}
			}
		}
		else{
			for (i=0; i<foldCount; i++) {
				if ((foldLevel[i]<=depth)) {showContent(i)} //nicht ändern Fehler 
				else {hideContent(i)}
			}
		}
	}
}

function showBranch(p) {searchBranch(p, true)}
function hideBranch(p) {searchBranch(p, false)}

function searchBranch(p, show_hide) {//alert(p)
	if (!parseInt(p)) {
		if (p) {										// Parameter=this...
			while (p.id.indexOf(foldID)!=0 && p.parentNode) {p=p.parentNode}		//...übergeordneten Fold-Bereich suchen
			if (p.id.indexOf(foldID)==0) {loopBranch(p.firstChild.nextSibling, show_hide)}						// wenn gefunden, Rekursion starten
		}
	}
	else if (document.getElementById(contentID+p)) {												// Wenn spezifiziertes Objekt existiert...
		loopBranch(document.getElementById(contentID+p), show_hide)						// ...Rekursion starten
	}
}
	
function loopBranch(obj, show_hide){
	while (obj) {
		if (obj.id && obj.id.substr(0,contentID.length)==contentID) {			// Inhaltsbereich?
			if (show_hide) {showContent(parseInt(obj.id.substr(contentID.length)))}	// Anzeigen...
			else {hideContent(parseInt(obj.id.substr(contentID.length)))}					// ...oder verstecken
		}
		if (obj.firstChild) {	loopBranch(obj.firstChild, show_hide)}		// existiert ein Kind? Dieses rekursiv bearbeiten
		obj=obj.nextSibling
	}
}

function jump(name) {
	a=document.getElementsByName(name)
	if (a[0] && a[0].tagName.toLowerCase()=="a") {
		pointer=a[0]
		while (pointer.tagName.toLowerCase()!="body") {
			if (pointer.className==hideClass) {showContent(pointer.id.substr(contentID.length))}
			pointer=pointer.parentNode
		}
		if (params["HIGHLIGHT_TARGET"]) {
			if (blinkHandle) {									// schon am Blinken?
				clearInterval(blinkHandle)
				blinkObj.className=blinkObjClass		// Klasse zurücksetzen
			}
			blinkObj=a[0]										// Blink Objekt und seine Klasse zwischenspeichern
			blinkObjClass=blinkObj.className
			blinkCount=blinkMax*2								// Zähler setzen
			blinkHandle=window.setInterval("highlight(a[0])", blinkInterval)
		}
		window.location.href="#"+name
	}
	else {alert("Sprungmarke ["+name+"] nicht definiert!")}
}

function highlight() {
	if (blinkMax==0 || blinkCount>0) {
		if (blinkObj.className==highlightClass) {blinkObj.className=blinkObjClass}
		else {blinkObj.className=highlightClass}
		blinkCount-=1
	}
	else {
		clearInterval(blinkHandle)					// Blinken stoppen
		blinkObj.className=blinkObjClass		// Klasse zurücksetzen
	}
}

function  printDoc(params){
	doc=window.location.href.substr(0,window.location.href.length-window.location.search.length-window.location.hash.length)+"?"+params
	printWin=window.open(doc, 'Anzeige','top=0, left=0, status=no, toolbar=no, menubar=no, location=no, resizable=yes, height=400, width=650')
	window.setTimeout("printWin.print()",2000)
}
