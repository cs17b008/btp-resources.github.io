// Here is all the code that builds the list of objects on the right-hand 
// side of the Labelme tool.
//
// The styles for this tools are defined inside:
// annotationTools/css/object_list.css


var IsHidingAllPolygons = false;
var ListOffSet = 0;

// This function creates and populates the list 
function RenderObjectList() {
  // If object list has been rendered, then remove it:
  var scrollPos = $("#anno_list").scrollTop();
  if($('#anno_list').length) {
    $('#anno_list').remove();
  }

  var html_str = '<div class="object_list" id="anno_list" style="border:0px solid black;z-index:0; top:14rem;" ondrop="drop(event, -1)" ondragenter="return dragEnter(event)" ondragover="return dragOver(event)">';
  
  var Npolygons = LMnumberOfObjects(LM_xml);
  var NundeletedPolygons = 0;

  // Count undeleted objects:
  for(var ii=0; ii < Npolygons; ii++) {
    if(!parseInt(LMgetObjectField(LM_xml,ii,'deleted'))) {
      NundeletedPolygons++;
    }
  }
  
  // Get parts tree
  var tree = getPartsTree();
  
  
  // Create DIV
  if (showImgName) {html_str += '<p><b>Image name: '+ imgName +'</b></p>';}
  html_str += '<b>Polygons in this image ('+ NundeletedPolygons +')</b>';
  html_str += '<p style="font-size:10px;line-height:100%"><a ' +
  'onmouseover="main_canvas.ShadePolygons();" ' +
  'onmouseout="main_canvas.RenderAnnotations();"> Reveal unlabeled pixels </a></p>';
  // Create "hide all" button:
  if(IsHidingAllPolygons) {
    html_str += '<p style="font-size:10px;line-height:100%"><a id="show_all_button" href="javascript:ShowAllPolygons();">Show all polygons</a></p>';
  }
  else {
    IsHidingAllPolygons = false;
    html_str += '<p style="font-size:10px;line-height:100%"><a id="hide_all_button" href="javascript:HideAllPolygons();">Hide all polygons</a></p>';
  }
/*
  html_str += '<p style="font-size:10px;line-height:100%"><a id="show_tess_button" href="javascript:ShowTesseractAnnotations();">Auto annotate using Tesseract</a></p>';

  html_str += '<p style="font-size:10px;line-height:100%"><a id="hide_tess_button" href="javascript:DeleteAnnotationsByTesseract();">Delete annotations by Tesseract</a></p>';
*/
  /*html_str += `
              <div class="dropdown">
                <button class="dropbtn">Auto Annotate using Model Pools</button>
                <div class="dropdown-content">
                  <a id="show_model_button" href="javascript:ShowModelAnnotations('pronoun');">Pool-Pronoun</a>
                  <a id="show_model_button" href="javascript:ShowModelAnnotations('noun');">Pool-Noun</a>
                  <a id="show_model_button" href="javascript:ShowModelAnnotations('article');">Pool-Article</a>
                  <a id="show_model_button" href="javascript:ShowModelAnnotations('preposition');">Pool-Preposition</a>
                  <a id="show_model_button" href="javascript:ShowModelAnnotations('conjunction');">Pool-Conjunction</a>
                </div>
              </div>          
            `;
	
  html_str += `
  <div class="dropdown" style="margin-top:2rem;">
    <button class="dropbtn">Delete Annotations by Model Pools</button>
    <div class="dropdown-content">
      <a id="hide_model_button" href="javascript:DeleteAnnotationsByModel('pronoun');">Pool-Pronoun</a>
      <a id="hide_model_button" href="javascript:DeleteAnnotationsByModel('noun');">Pool-Noun</a>
      <a id="hide_model_button" href="javascript:DeleteAnnotationsByModel('article');">Pool-Article</a>
      <a id="hide_model_button" href="javascript:DeleteAnnotationsByModel('preposition');">Pool-Preposition</a>
      <a id="hide_model_button" href="javascript:DeleteAnnotationsByModel('conjunction');">Pool-Conjunction</a>
    </div>
  </div>          
`;*/

  // Add parts-of drag-and-drop functionality:
  if(use_parts) {
    html_str += '<p style="font-size:10px;line-height:100%" ondrop="drop(event, -1)" ondragenter="return dragEnter(event)" ondragover="return dragOver(event)">Drag a tag on top of another one to create a part-of relationship.</p>';
  }
  html_str += '<ol>';

  // Show list (of non-deleted objects)
  for(var i=0; i < Npolygons; i++) {
    // get part level and read objects in the order given by the parts tree
    if(use_parts) {
      var ii = tree[0][i];
      var level = tree[1][i];
    }
    else {
      var ii = i;
      var level = 0;
    }
    
    var isDeleted = parseInt(LMgetObjectField(LM_xml,ii,'deleted'));
    var is_currently_shown = true;
    
    if(is_currently_shown && (((ii<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || ((ii>=num_orig_anno)&&(!isDeleted||(isDeleted&&view_Deleted))))) {
      // change the left margin as a function of part level
      
      html_str += '<div class="objectListLink" id="LinkAnchor' + ii + '" style="z-index:1; margin-left:'+ (level*1.5) +'em" ';
      
      if (use_parts) {
	      // define drag events (but only if the tool is allowed to use parts)
	      html_str += 'draggable="true" ondragstart="drag(event, '+ii+')" '+
	      'ondragend="dragend(event, '+ii+')" '+
	      'ondrop="drop(event, '+ii+')" '+
	      'ondragenter="return dragEnter(event)" '+
	      'ondragover="return dragOver(event)">';
      }
      
      // change the icon for parts
      if(level==0) {
	      // if it is not a part, show square
	      html_str += '<li>';
      }
      else {
	      // if it is a part, use part style
	      html_str += '<li class="children_tree">';
      }
      
      // show object name:
      html_str += '<a class="objectListLink"  id="Link' + ii + '" '+
	    'href="javascript:main_handler.AnnotationLinkClick('+ii+');" '+
	    'onmouseover="main_handler.AnnotationLinkMouseOver('+ii+');" ' +
	    'onmouseout="main_handler.AnnotationLinkMouseOut();" ';
      
      if (use_parts) {
	      html_str += 'ondrop="drop(event, '+ii+')" '+
	      'ondragend="dragend(event, '+ii+')" '+
	      'ondragenter="return dragEnter(event)" '+
	      'ondragover="return dragOver(event)"';
      }
      
      if(isDeleted) {
	      html_str += ' style="color:#888888"><b>';
      }
      else {
      	html_str += '>';
      }

      var obj_name = LMgetObjectField(LM_xml,ii,'name');
      if(obj_name.length==0 && !draw_anno) {
	      html_str += '<i>[ Please enter name ]</i>';
      }
      else {
      	html_str += obj_name;
      }
      
      if(isDeleted) html_str += '</b>';
      html_str += '</a>';

      var attributes = LMgetObjectField(LM_xml,ii,'attributes');
      if(attributes.length>0)
      {
        var index = attributes.indexOf("");
        if(index>-1)
        {
          attributes.splice(index,1);
        }
      }
      if(attributes.length>0) {
        html_str += ' (' ;
        for (var j=0;j<attributes.length;j++)
        {
          if(attributes[j].length>0)
          {
            html_str += attributes[j];
            if(j!=attributes.length-1){
              html_str += ',';
            }
          }
        }
	      html_str += ')';
      }
      
      html_str += '</li></div>';
    }
  }
  
  html_str += '</ol><p><br/></p></div>';
  
  // Attach annotation list to 'anno_anchor' DIV element:
  $('#anno_anchor').append(html_str);
  $('#Link'+add_parts_to).css('font-weight',700); //
  $('#anno_list').scrollTop(scrollPos);
}


function RemoveObjectList() {
  $('#anno_list').remove();
}


function ChangeLinkColorBG(idx) {
  if(document.getElementById('Link'+idx)) {
    var isDeleted = parseInt($(LM_xml).children("annotation").children("object").eq(idx).children("deleted").text());
    if(isDeleted) document.getElementById('Link'+idx).style.color = '#888888';
    else document.getElementById('Link'+idx).style.color = '#0000FF';
    var anid = main_canvas.GetAnnoIndex(idx);
    // If we're hiding all polygons, then remove rendered polygon from canvas:
    if(IsHidingAllPolygons && main_canvas.annotations[anid].hidden) {
      main_canvas.annotations[anid].DeletePolygon();
    }
  }
}


function ChangeLinkColorFG(idx) {
  document.getElementById('Link'+idx).style.color = '#FF0000';
  var anid = main_canvas.GetAnnoIndex(idx);
  // If we're hiding all polygons, then render polygon on canvas:
  if(IsHidingAllPolygons && main_canvas.annotations[anid].hidden) {
    main_canvas.annotations[anid].DrawPolygon(main_media.GetImRatio(), main_canvas.annotations[anid].GetPtsX(), main_canvas.annotations[anid].GetPtsY());
  }
}

function HideAllPolygons() {
  if(!edit_popup_open) {
    // Set global variable:
    IsHidingAllPolygons = true;
    
    // Delete all polygons from the canvas:
    for(var i = 0; i < main_canvas.annotations.length; i++) {
      main_canvas.annotations[i].DeletePolygon();
      main_canvas.annotations[i].hidden = true;
    }
    
    // Create "show all" button:
    $('#hide_all_button').replaceWith('<a id="show_all_button" href="javascript:ShowAllPolygons();">Show all polygons</a>');
  }
  else {
    alert('Close edit popup bubble first');
  }
}

function ShowAllPolygons() {
  // Set global variable:
  IsHidingAllPolygons = false;

  // Render the annotations:
  main_canvas.UnhideAllAnnotations();
  main_canvas.RenderAnnotations();

  // Create "hide all" button:
  $('#show_all_button').replaceWith('<a id="hide_all_button" href="javascript:HideAllPolygons();">Hide all polygons</a>');
}

// *******************************************
// Private functions:
// *******************************************

// DRAG FUNCTIONS

function drag(event, part_id) {
  // stores the object id in the data that is being dragged.
  event.dataTransfer.setData("Text", part_id);
}

function dragend(event, object_id) {
  event.preventDefault();
  
  // Write XML to server:
  WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
}

function dragEnter(event) {
  event.preventDefault();
  return true;
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event, object_id) {
  event.preventDefault();
  var part_id=event.dataTransfer.getData("Text");
  event.stopPropagation();
  
  // modify part structure
  if(object_id!=part_id) {
    addPart(object_id, part_id);
    
    // redraw object list
    RenderObjectList();
  }
}

/**
 * Auto annotation of the image using Tesseract.
 *
 * It requests tesseract annotations and renders them on the immage.
 * It also updates the XML file accordingly.
 *  * 
 * @since      21-05-2020
 * @author     Vidya Rodge <cs16b023@iittp.ac.in>
 *
 */
function ShowTesseractAnnotations(){
  if(tess_anno==0){
  console.log(LM_xml);
  
  var collection_name = main_media.file_info.collection.toLowerCase()
  var url = '/annotate/auto/tesseract?mode=' + main_media.file_info.mode + '&username=' + username + '&collection=' + collection_name + '&folder=' + main_media.file_info.dir_name + '&image=' + main_media.file_info.im_name;
  console.log("\n**************\n")
  console.log('object_list: \n')
  console.log(url)
  console.log("\n**************\n")
  var json_req = $.getJSON(url, function(result, status, xhr){
    console.log("Annotations recieved from tesseract");
    var numItems = $(LM_xml).children('annotation').children('object').length;
    console.log(numItems);
    username = 'tesseract'
    const xml_str = Object.entries(result);
    
    for (const [label, list_list] of xml_str) {
      for(var h=0; h<list_list.length; h++) {
      var anno;
      var list_co = list_list[h];
      console.log("label = ", label, "list = ", list_co);

      // // Update old and new object names for logfile:
      new_name = label;

      global_count++;

      // Insert data into XML:
      var html_str = '<object>';
      html_str += '<name>' + new_name + '</name>';
      html_str += '<deleted>0</deleted>';
      html_str += '<verified>0</verified>';
      // if(use_attributes) {
      html_str += '<occluded>' + "" + '</occluded>';
      html_str += '<taglist>' + "" + '</taglist>';
      // }
      html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
      var ts = get_date(); // GetTimeStamp();
      html_str += '<date>' + ts + '</date>';
      html_str += '<id>' + numItems + '</id>';
      // if (bounding_box){
          html_str += '<type>'
          html_str += 'bounding_box';
          html_str += '</type>'
        // } 
      numItems++;
      
      html_str += '<polygon>';
      html_str += '<username>' + username + '</username>';
      
      //point 1
      html_str += '<pt>';
      html_str += '<x>' + list_co[0] + '</x>';
      html_str += '<y>' + list_co[1] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 2
      html_str += '<pt>';
      html_str += '<x>' + list_co[2] + '</x>';
      html_str += '<y>' + list_co[1] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 3
      html_str += '<pt>';
      html_str += '<x>' + list_co[2] + '</x>';
      html_str += '<y>' + list_co[3] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 4
      html_str += '<pt>';
      html_str += '<x>' + list_co[0] + '</x>';
      html_str += '<y>' + list_co[3] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';
      


      html_str += '<closed_date>' + ts + '</closed_date>';
      html_str += '</polygon>';
      html_str += '</object>';
      $(LM_xml).children("annotation").append($(html_str));
      console.log($(LM_xml).children('annotation').children('object').length);

    }
  }

    //instead of returning load the xml file again
    // Write XML to server:
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
    LoadAnnotationSuccess(LM_xml);
    console.log(LM_xml);
    console.log($(LM_xml).children('annotation').children('object').length);
    tess_anno=1;
});
  }
}


/**
 * Deletes all the annotations by Tesseract.
 *
 * It deletes all the annotations made by tesseract by searching through the XML file.
 * It also removes them from the screen.
 *  
 * @since      21-05-2020
 * @author     Vidya Rodge <cs16b023@iittp.ac.in>
 *
 */
function DeleteAnnotationsByTesseract(){
    if(tess_anno==0) return;
    
    var obj_elts = LM_xml.getElementsByTagName("object");
    var num_obj = obj_elts.length;
    console.log("no of elements before deletion", num_obj);
    tess_anno = 0;
    var delIdx = [];
    var xml_idx = [];

    for(var pp = 0; pp < num_obj; pp++) {
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);
      
      var status = curr_obj.children("deleted").text();
      if(status!='1'){
        if(curr_obj.children("polygon").children("username").text() == "tesseract") {
          xp = curr_obj.children("id").text();
          delIdx.push(parseInt(xp));
          xml_idx.push(pp);
        }
      }
    }
     
    var idLen, i;
    idLen = delIdx.length;
    console.log("no of anno to be del:", delIdx);
    for (i = 0; i < idLen; i++) {
      console.log("deleted: ", delIdx[i]);
      DeleteAnnotationById(delIdx[i], xml_idx[i]);
    }
    // for(var it = 0; it < main_canvas.annotations.length; it++) {
      console.log("anno main canv len = ", main_canvas.annotations.length);
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
    console.log(LM_xml.getElementsByTagName("object").length);
    LoadAnnotationSuccess(LM_xml);
    // }
    tess_anno=0;

}

/**
 * Deletes an annotation given its id.
 *
 * It deletes all a particular annotation with given id.
 *  
 * @since      21-05-2020
 * @author     Vidya Rodge <cs16b023@iittp.ac.in>
 *
 */
function DeleteAnnotationById(idx, selected_poly) {

  $(LM_xml).children("annotation").children("object").eq(selected_poly).children("deleted").text('1');

  // Delete the polygon from the canvas:
  main_canvas.DetachAnnotation(idx);

}


/**
 * Auto annotation of the image using CNN model.
 *
 * It requests CNN model annotations and renders them on the immage.
 * It also updates the XML file accordingly.
 *  * 
 * @since      30-05-2020
 * @author     Vidya Rodge <cs16b023@iittp.ac.in>
 *
 */
function ShowModelAnnotations(pool_name){
  if(model_anno==0){
  console.log(LM_xml);
  
  var collection_name = main_media.file_info.collection.toLowerCase()
  var url = '/annotate/auto/model?mode=' + main_media.file_info.mode + '&username=' + username + '&collection=' + collection_name + '&folder=' + main_media.file_info.dir_name + '&image=' + main_media.file_info.im_name+ '&pool=' + pool_name;
  console.log("\n**************\n")
  console.log('object_list: \n')
  console.log(url)
  console.log("\n**************\n")
    // document.body.style.background = "#4457C0"
    // document.body.style.opacity = "0.3" 
   // document.getElementById('loading_text').style.opacity = '1'
    // document.getElementById('anno_info').style.display = "block"
    // document.getElementById('anno_info').innerHTML = "Please wait while we annotate"
    // document.getElementById('anno_rotator').style.display = "block"
    // document.getElementById('anno_establishment').style.display = "block"
    document.getElementById('auto_annotating').style.display = 'inline-block'
  var json_req = $.getJSON(url, function(result, status, xhr){
      console.log('step2')
      // console.log(window.location.href)
      // document.body.style.background = "unset"
      // document.getElementById('anno_info').style.display = "none"
      // document.getElementById('anno_rotator').style.display = "none"
      // document.getElementById('anno_establishment').style.display = "none"
      // document.body.style.opacity = "1" 
      document.getElementById('auto_annotating').style.display = 'none'
      console.log("Annotations recieved from ML Model");
    
    var numItems = $(LM_xml).children('annotation').children('object').length;
    console.log(numItems);
    username = 'model_'+pool_name
    const xml_str = Object.entries(result);
    
    for (const [label, list_list] of xml_str) {
      for(var h=0; h<list_list.length; h++) {
      var anno;
      var list_co = list_list[h];
      console.log("label = ", label, "list = ", list_co);
      


      // // Update old and new object names for logfile:
      new_name = label;
      
      global_count++;

      // Insert data into XML:
      var html_str = '<object>';
      html_str += '<name>' + new_name + '</name>';
      html_str += '<deleted>0</deleted>';
      html_str += '<verified>0</verified>';
      // if(use_attributes) {
      html_str += '<occluded>' + "" + '</occluded>';
      html_str += '<taglist>' + "" + '</taglist>';
      // }
      html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
      var ts = get_date(); // GetTimeStamp();
      html_str += '<date>' + ts + '</date>';
      html_str += '<id>' + numItems + '</id>';
      // if (bounding_box){
          html_str += '<type>'
          html_str += 'bounding_box';
          html_str += '</type>'
        // } 
      numItems++;
      
      html_str += '<polygon>';
      html_str += '<username>' + username + '</username>';
      
      //point 1
      html_str += '<pt>';
      html_str += '<x>' + list_co[0] + '</x>';
      html_str += '<y>' + list_co[1] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 2
      html_str += '<pt>';
      html_str += '<x>' + list_co[2] + '</x>';
      html_str += '<y>' + list_co[1] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 3
      html_str += '<pt>';
      html_str += '<x>' + list_co[2] + '</x>';
      html_str += '<y>' + list_co[3] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';

      //point 4
      html_str += '<pt>';
      html_str += '<x>' + list_co[0] + '</x>';
      html_str += '<y>' + list_co[3] + '</y>';
      html_str += '<time>' + ts + '</time>';
      html_str += '</pt>';
      


      html_str += '<closed_date>' + ts + '</closed_date>';
      html_str += '</polygon>';
      html_str += '</object>';
      $(LM_xml).children("annotation").append($(html_str));
      console.log($(LM_xml).children('annotation').children('object').length);

    }
  }

    //instead of returning load the xml file again
    // Write XML to server:
    console.log("\n******************\n")
    console.log("before:\n")
    console.log($(LM_xml).children('annotation').children('folder').text()+"\n")
    string_val = $(LM_xml).children('annotation').children('folder').text()
    string_val = string_val.split(".com")[0] + ".com"
    console.log(string_val)
    //$(LM_xml).children('annotation').children('folder').text(string_val)
    console.log("after:\n")
    console.log($(LM_xml).children('annotation').children('folder').text())
    console.log("\n******************\n")
    console.log("SubmitXmlURL: ", SubmitXmlUrl)
  //   document.body.style.background = "#4457C0"
  //   document.body.style.opacity = "0.3" 
  //  // document.getElementById('loading_text').style.opacity = '1'
  //   document.getElementById('anno_info').style.display = "block"
  //   document.getElementById('ann_info').innerHTML = "Please wait while we annotate"
  //   document.getElementById('anno_rotator').style.display = "block"
  //   document.getElementById('anno_establishment').style.display = "block"
    WriteXML(SubmitXmlUrl,LM_xml,function(){
      // console.log('step2')
      // console.log(window.location.href)
      // document.body.style.background = "unset"
      // document.getElementById('anno_info').style.display = "none"
      // document.getElementById('anno_rotator').style.display = "none"
      // document.getElementById('anno_establishment').style.display = "none"
      // document.body.style.opacity = "1" 
      return;
    
    });
    LoadAnnotationSuccess(LM_xml);
    console.log(LM_xml);
    console.log($(LM_xml).children('annotation').children('object').length);
    model_anno=1;
    // setTimeout(() => {
    //   document.getElementById('anno_next').click()
    // }, 500);
    // http://127.0.0.1:5000/annotate?collection=LabelMekowndi4554&mode=i&folder=docs_kowndi4554&image=document1.jpg&username=kowndi4554
    window.location.href = window.location.href

});
  }
  else{
    console.log('model annotations else-way: ')
    setTimeout(() => {
      document.getElementById('anno_next').click()
    }, 500);
  }
}

/**
 * Deletes all the annotations by CNN model.
 *
 * It deletes all the annotations made by CNN model by searching through the XML file.
 * It also removes them from the screen.
 *  
 * @since      21-05-2020
 * @author     Vidya Rodge <cs16b023@iittp.ac.in>
 *
 */
function DeleteAnnotationsByModel(pool_name){
    pool = {"pronoun":"she,you,it,me", "preposition":"to,in,on,at,by,for", "conjunction":"that,and,but,or,so", "article":"a,an,the", "noun":"tree,song,rose,brown,shadow"}
    if(model_anno==0) return;
    
    var obj_elts = LM_xml.getElementsByTagName("object");
    var num_obj = obj_elts.length;
    console.log("no of elements before deletion", num_obj);
    model_anno = 0;
    var delIdx = [];
    var xml_idx = [];

    for(var pp = 0; pp < num_obj; pp++) {
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);
      
      var status = curr_obj.children("deleted").text();
      if(status!='1'){
        if(curr_obj.children("polygon").children("username").text() == "model"+pool_name) {
          xp = curr_obj.children("id").text();
          delIdx.push(parseInt(xp));
          xml_idx.push(pp);
        }
      }
    }
     
    var idLen, i;
    idLen = delIdx.length;
    console.log("no of anno to be del:", delIdx);
    for (i = 0; i < idLen; i++) {
      console.log("deleted: ", delIdx[i]);
      DeleteAnnotationById(delIdx[i], xml_idx[i]);
    }
    console.log("anno main canv len = ", main_canvas.annotations.length);
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
    console.log(LM_xml.getElementsByTagName("object").length);
    LoadAnnotationSuccess(LM_xml);
    model_anno=0;

}
