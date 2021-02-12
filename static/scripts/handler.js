/** @file 
This contains the high-level commands for transitioning between the different annotation tool states.  They are: REST, DRAW, SELECTED, QUERY.
*/

// Handles all of the user's actions and delegates tasks to other classes.
// Also keeps track of global information.
var REST_CANVAS = 1;
var DRAW_CANVAS = 2;
var SELECTED_CANVAS = 3;
var QUERY_CANVAS = 4;

// Global variable indicating which canvas is active:
var active_canvas = REST_CANVAS;

// Check if we are in add parts mode
var add_parts_to = null;

function get_date(){

  var currentdate = new Date(); 
  var datetime =  ('0'+currentdate.getDate()).slice(-2) + "-"
                  + ('0'+(currentdate.getMonth()+1)).slice(-2)  + "-" 
                  + ('0'+currentdate.getFullYear()).slice(-2) + " "  
                  + ('0'+currentdate.getHours()).slice(-2) + ":"  
                  + ('0'+currentdate.getMinutes()).slice(-2) + ":" 
                  + ('0'+currentdate.getSeconds()).slice(-2) + ":"
                  + ("00"+currentdate.getMilliseconds()).slice(-3);
  return datetime;
}

function handler() {
    
    // *******************************************
    // Public methods:
    // *******************************************
    

    this.StartAddParts = function(){
      
      if (select_anno){
        var anno_id = select_anno.anno_id;
        this.SubmitEditLabel();
        add_parts_to = anno_id;
      }
      else {
        var anno = this.SubmitQuery();
        console.log('phase1')
        add_parts_to = anno.anno_id;
      }
      $('#Link'+add_parts_to).css('font-weight',700);
    }

    /**
      * This function is called when add parts is clcked for giving multiple annotations
      * 
      * @since      26-05-2020
      * @author     Reena Deshmukh <cs16b029@iittp.ac.in>
      * 
    */
    this.StartEditAddParts = function(){
      
      if (select_anno){
        var anno_id = select_anno.anno_id;
        this.SubmitEditQuery();
        add_parts_to = anno_id;
      }
      else {
        var anno = this.SubmitQuery();
        console.log('phase2')
        add_parts_to = anno.anno_id;
      }
      $('#Link'+add_parts_to).css('font-weight',700);
    }

    /**
      * @since      26-05-2020
      * @author     Reena Deshmukh <cs16b029@iittp.ac.in>
      * 
    */
    this.StopEditAddParts = function(){
      if (select_anno) this.SubmitEditQuery();
      else this.SubmitQuery();
      $('#Link'+add_parts_to).css('font-weight', 400);
      add_parts_to = null;
    }

    this.StopAddParts = function(){
      if (select_anno) this.SubmitEditLabel();
      else this.SubmitQuery();
      $('#Link'+add_parts_to).css('font-weight', 400);
      add_parts_to = null;
    }

    // Handles when the user presses the delete button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectDeleteButton = function () {
      submission_edited = 0;
      this.QueryToRest();
      CloseQueryPopup();
      if (scribble_canvas.scribblecanvas) scribble_canvas.cleanscribbles();
    };
    
    // Submits the object label in response to the edit/delete popup bubble.
    this.SubmitEditLabel = function () {

      if (scribble_canvas.scribblecanvas){
        scribble_canvas.annotationid = -1;
        scribble_canvas.cleanscribbles();
      } 
      submission_edited = 1;
      var anno = select_anno;
      
      // object name
      old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
      if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
      else new_name = RemoveSpecialChars(adjust_objEnter);
      
      var re = /[a-zA-Z0-9]/;
      if(!re.test(new_name)) {
	      alert('Please enter an object name');
	      return;
      }
      
      if (use_attributes) {
      //	occlusion field
      	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
      	else new_occluded = RemoveSpecialChars(adjust_occluded);
      	
      	//attributes field
      	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
      	else new_attributes = RemoveSpecialChars(adjust_attributes);
      }
      
      new_attributes = new_attributes.replace(/\s+,|,\s+/g, ",");
      new_attributes = new_attributes.replace(/^\s+|\s+$/g, "");
      new_attributes_list = new_attributes.split(',');
     
      StopEditEvent2();
      
      // Insert data to write to logfile:
      if(editedControlPoints) InsertServerLogData('cpts_modified');
      else InsertServerLogData('cpts_not_modified');
      
      // Object index:
      var obj_ndx = anno.anno_id;
      
      // Pointer to object:
      
      // Set fields:
      LMsetObjectField(LM_xml, obj_ndx, "name", new_name);
      LMsetObjectField(LM_xml, obj_ndx, "automatic", "0");
      
      // Insert attributes (and create field if it is not there):
      LMsetObjectField(LM_xml, obj_ndx, "attributes", new_attributes_list);
        
      
      LMsetObjectField(LM_xml, obj_ndx, "occluded", "yes");
      
      // Write XML to server:
      // document.body.style.background = "#4457C0"
      // document.body.style.opacity = "0.3" 
      // document.getElementById('info').style.display = "block"
      // document.getElementById('info').innerHTML = "Storing as anti-pattern in the database"
      // document.getElementById('rotator').style.display = "block"
      // document.getElementById('establishment').style.display = "block"
      //CloseQueryPopup();
      document.getElementById('anti_pattern_button').style.display = 'inline-block';
      WriteXML(SubmitXmlUrl,LM_xml,function(){
        console.log('step1')
        image_nm = window.location.href.split("&")[3].split("=")[1]
        console.log(window.location.href)
        console.log(image_nm)           
      // document.body.style.background = "unset"
      // document.getElementById('info').style.display = "none"
      // document.getElementById('rotator').style.display = "none"
      // document.getElementById('establishment').style.display = "none"
      // document.body.style.opacity = "1" 
      //   setTimeout(() => {
      //     document.getElementById('re_train_model_loader').href = "/anti_pattern_loader?ann="+new_name.toString()+"&im="+image_nm.toString()
      //     // document.getElementById('re_train_model_loader').click()
      //     return;
      //   }, 1000);
        CloseEditPopup();
        return;});
      
      // Refresh object list:
      if(view_ObjList) {
      	RenderObjectList();
        ChangeLinkColorFG(anno.GetAnnoID());
        console.log("Refresh object list: handler.js")
      }
    };
    
    /**
      * Submits the object label for mutiple annotations.
      * 
      * This function is  triggered when submit button is clicked 
      * in multiple annotations popup bubble.
      * 
      * @since      26-05-2020
      * @author     Reena Deshmukh <cs16b029@iittp.ac.in>
      * 
    */
    this.SubmitEditQuery = function() {

      var numItems = $(LM_xml).children('annotation').children('object').length;
      var nn;
      var old_anno = select_anno;

      console.log("anno : ",old_anno);
      
      // If the attributes are active, read the fields.
      if (use_attributes) {
	      // get attributes (is the field exists)
	      if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
	      else new_attributes = "";

	      // get occlusion field (is the field exists)
	      if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
	      else new_occluded = "";
      }
      
      nn = RemoveSpecialChars(document.getElementById('objEnter').value);
      var re = /[a-zA-Z0-9]/;
      if(!re.test(nn)) {
         alert('Please enter an object name');
         return;
      }
    
      unselectObjects();
      StopNewEditEvent();
      
      // Update old and new object names for logfile:
      new_name = nn;
      old_name = nn;
      var new_anno=Object.assign({},old_anno);
      new_anno.anno_id=numItems;
      
      // Obtain time
      var datetime = get_date();
      new_anno.time_point.push(datetime);
      new_anno.closing_time = datetime;
      
      // set points
      //var pt_x = old_anno.GetPtsX();
      //var pt_y = old_anno.GetPtsY();
      var pt_x = LMgetObjectField(LM_xml, old_anno.anno_id, 'x');
      var pt_y = LMgetObjectField(LM_xml, old_anno.anno_id, 'y');

      LMsetObjectField(LM_xml, new_anno.anno_id, 'x',pt_x );
      LMsetObjectField(LM_xml, new_anno.anno_id, 'y',pt_y );
      var pt_xx = LMgetObjectField(LM_xml, new_anno.anno_id, 'x');
      var pt_yy = LMgetObjectField(LM_xml, new_anno.anno_id, 'y');
      console.log(pt_x, pt_y);
      console.log(pt_xx, pt_yy);
      
      submission_edited = 0;
      global_count++;

      new_attributes = new_attributes.replace(/\s+,|,\s+/g, ",");
      new_attributes = new_attributes.replace(/^\s+|\s+$/g, "");
      new_attributes_list = new_attributes.split(',');

      // Insert data for server logfile:
      InsertServerLogData('cpts_not_modified');
      
      // Insert data into XML:
      var html_str = '<object>';
      html_str += '<name>' + new_name + '</name>';
      html_str += '<deleted>0</deleted>';
      html_str += '<verified>0</verified>';
      if(use_attributes) {
        html_str += '<occluded>' + new_occluded + '</occluded>';
        html_str += '<taglist>'
        for(var i=0;i<new_attributes_list.length;i++)
        {
          if(new_attributes_list[i]!=""){
              html_str += '<tag>' + new_attributes_list[i] + '</tag>';
          }
        }
	      html_str +='</taglist>';
      }
      html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
      var ts = get_date(); // GetTimeStamp();
      html_str += '<date>' + ts + '</date>';
      html_str += '<id>' + new_anno.anno_id + '</id>';
      if (bounding_box){
          html_str += '<type>'
          html_str += 'bounding_box';
          html_str += '</type>'
      } 
      if(new_anno.GetType() == 1) {
    

        /*************************************************************/
	      /*************************************************************/
	      // Scribble: Add annotation to LM_xml:
	      html_str += '<segm>';
	      html_str += '<username>' + username + '</username>';

	      html_str += '<box>';
	      html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>'; 
	      html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
	      html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>'; 
	      html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
	      html_str += '</box>';

	      html_str += '<mask>'+ scribble_canvas.image_name +'</mask>';

	      html_str += '<scribbles>';
	      html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>'; 
	      html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
	      html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>'; 
	      html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
	      html_str += '<scribble_name>'+ scribble_canvas.scribble_name +'</scribble_name>'; 
	      html_str += '</scribbles>';

	      html_str += '</segm>';
	      html_str += '</object>';
	      $(LM_xml).children("annotation").append($(html_str));
	      /*************************************************************/
	      /*************************************************************/
      }  
      else {
	      html_str += '<polygon>';
	      html_str += '<username>' + username + '</username>';
	      for(var jj=0; jj < pt_x.length; jj++) {
	        html_str += '<pt>';
	        html_str += '<x>' + pt_x[jj] + '</x>';
	        html_str += '<y>' + pt_y[jj] + '</y>';
	        if (new_anno.time_point != null){
	          html_str += '<time>' + new_anno.time_point[jj] + '</time>';
	        }
	        html_str += '</pt>';
	      }
	      html_str += '<closed_date>' + new_anno.closing_time + '</closed_date>';
	      html_str += '</polygon>';
	      html_str += '</object>';
	      $(LM_xml).children("annotation").append($(html_str));
      }
      
      //anno.anno_id=numItems;

      console.log(main_canvas.annotations);
      if(!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml)-1, 'deleted') ||view_Deleted) {
        console.log("Attached to main canvas");
	      main_canvas.AttachAnnotation(new_anno);
	      new_anno.RenderAnnotation('rest');
      }

      /*************************************************************/
      /*************************************************************/
      // Scribble: Clean scribbles.
      if(new_anno.GetType() == 1) {
      	scribble_canvas.cleanscribbles();
      	scribble_canvas.scribble_image = "";
      	scribble_canvas.colorseg = Math.floor(Math.random()*14);
      }
      /*************************************************************/
      /*************************************************************/

      if (add_parts_to != null) addPart(add_parts_to, new_anno.anno_id);
      // Write XML to server:
      WriteXML(SubmitXmlUrl,LM_xml,function(){
        console.log('step4')
        console.log(window.location.href)
        return;});
      
      console.log(main_canvas.annotations);
      
      if(view_ObjList) {
        RenderObjectList();
      }
      console.log(main_canvas.annotations);

      var m = main_media.GetFileInfo().GetMode();
      if(m=='mt') {
      	document.getElementById('object_name').value=new_name;
      	document.getElementById('number_objects').value=global_count;
      	document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe_' + username + '&mode=i&folder=' + main_media.GetFileInfo().GetDirName() + '&image=' + main_media.GetFileInfo().GetImName();
      	if(global_count >= mt_N) document.getElementById('mt_submit').disabled=false;
      }
      return new_anno;
    };

    // Handles when the user presses the delete button in response to
    // the edit popup bubble.
    this.EditBubbleDeleteButton = function () {
        var idx = select_anno.GetAnnoID();

        if((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, idx, 'username')))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }
        
        if(idx>=num_orig_anno) {
            global_count--;
        }
        
        submission_edited = 0;
        
        // Insert data for server logfile:
        old_name = LMgetObjectField(LM_xml,select_anno.anno_id,'name');
        new_name = old_name;
        WriteLogMsg('*Deleting_object');
        InsertServerLogData('cpts_not_modified');
        
        // Set <deleted> in LM_xml:
        LMsetObjectField(LM_xml, idx, "deleted", "1");
        
        // Remove all the part dependencies for the deleted object
        removeAllParts(idx);
        
        // Write XML to server:
        
      //  document.body.style.background = "#4457C0"
      //  document.body.style.opacity = "0.3" 
      // document.getElementById('loading_text').style.opacity = '1'
      //  document.getElementById('info').style.display = "block"
      //  document.getElementById('info').innerHTML = "Deleting annotation in the database"
      //  document.getElementById('rotator').style.display = "block"
      //  document.getElementById('establishment').style.display = "block"
          document.getElementById('delete_pattern_button').style.display = 'inline-block';
        WriteXML(SubmitXmlUrl,LM_xml,function(){
          console.log('step2')
          console.log(window.location.href)
          // document.body.style.background = "unset"
          // document.getElementById('info').style.display = "none"
          // document.getElementById('rotator').style.display = "none"
          // document.getElementById('establishment').style.display = "none"
          // document.body.style.opacity = "1" 
          CloseEditPopup();
       // CloseQueryPopup();
          return;});

	      // Refresh object list:
        if(view_ObjList) RenderObjectList();
        selected_poly = -1;
        unselectObjects(); // Perhaps this should go elsewhere...
        StopEditEvent2();
        if (scribble_canvas.scribblecanvas){
          scribble_canvas.annotationid = -1;
          scribble_canvas.cleanscribbles();
        } 
    };

    /**
      * 
      * @since      26-05-2020
      * @author     Reena Deshmukh <cs16b029@iittp.ac.in>
      * 
    */
    this.EditBubbleCancelButton = function() {
      submission_edited=0;
      StopNewEditEvent();
    };

    // Handles when the user clicks on the link for an annotation.
    this.AnnotationLinkClick = function (idx) {
      if (adjust_event) return;
      if (video_mode && LMgetObjectField(LM_xml, idx, 'x', oVP.getcurrentFrame()).length == 0){
        // get frame that is closest

        var frames = LMgetObjectField(LM_xml, idx, 't');
        var id1 = -1;
        var id2 = frames.length;
        var i = 0;
        while (i < frames.length){
          if (frames[i] >= oVP.getcurrentFrame()) id2 = Math.min(id2, i);
          else id1 = Math.max(id1, i);
          i++;
        }
        if (id2 < frames.length) oVP.GoToFrame(frames[id2]);
        else oVP.GoToFrame(frames[id1]);
      }
      if(active_canvas==REST_CANVAS) StartEditEvent(idx,null);
      else if(active_canvas==SELECTED_CANVAS) {
      	var anno_id = select_anno.GetAnnoID();
      	if(edit_popup_open){ 
          StopEditEvent();
          ChangeLinkColorBG(idx);
        }
        if (idx != anno_id){
          if (video_mode) oVP.HighLightFrames(LMgetObjectField(LM_xml, idx, 't'), LMgetObjectField(LM_xml, idx, 'userlabeled'));
          ChangeLinkColorFG(idx);
          StartEditEvent(idx,null);
        } 
      }
    };
    
    // Handles when the user moves the mouse over an annotation link.
    this.AnnotationLinkMouseOver = function (a) {
        if (active_canvas != SELECTED_CANVAS && video_mode && LMgetObjectField(LM_xml, a, 'x', oVP.getcurrentFrame()).length == 0){ 
          ChangeLinkColorFG(a);
          oVP.HighLightFrames(LMgetObjectField(LM_xml, a, 't'), LMgetObjectField(LM_xml, a, 'userlabeled'));
          selected_poly = a;
        } 
        else if(active_canvas!=SELECTED_CANVAS){
          selectObject(a);
          console.log('select');
        } 
        
    };
    
    // Handles when the user moves the mouse away from an annotation link.
    this.AnnotationLinkMouseOut = function () {
       
      if(active_canvas!=SELECTED_CANVAS){
        unselectObjects();
      }
    };
    
    // Handles when the user moves the mouse over a polygon on the drawing
    // canvas.
    this.CanvasMouseMove = function (event,pp) {
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        if(IsNearPolygon(x,y,pp)) selectObject(pp);
        else unselectObjects();
    };
    
    // Submits the object label in response to the "What is this object?"
    // popup bubble. THIS FUNCTION IS A MESS!!!!
    this.SubmitQuery = function () {
      var nn;
      var anno;
      
      // If the attributes are active, read the fields.
      if (use_attributes) {
	// get attributes (is the field exists)
	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
	else new_attributes = "";
	
	// get occlusion field (is the field exists)
	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
	else new_occluded = "";
      }
      
      new_attributes = new_attributes.replace(/\s+,|,\s+/g, ",");
      new_attributes = new_attributes.replace(/^\s+|\s+$/g, "");
      new_attributes_list = new_attributes.split(',');

      if((object_choices!='...') && (object_choices.length==1)) {
	nn = RemoveSpecialChars(object_choices[0]);
	  var re = /[a-zA-Z0-9]/;
	  if(!re.test(nn)) {
	    alert('Please enter an object name');
	    return;
	  }
	active_canvas = REST_CANVAS;
	
	
	// Remove polygon from the draw canvas:
	var anno = null;
	if(draw_anno) {
	  draw_anno.DeletePolygon();
	  anno = draw_anno;
	  draw_anno = null;
	}
      }
      else {
	nn = RemoveSpecialChars(document.getElementById('objEnter').value);
	var re = /[a-zA-Z0-9]/;
	if(!re.test(nn)) {
	   alert('Please enter an object name');
	   return;
	}
	anno = this.QueryToRest();
      }
      
	// Move draw canvas to the back:
	document.getElementById('draw_canvas').style.zIndex = -2;
	document.getElementById('draw_canvas_div').style.zIndex = -2;
      
      // Update old and new object names for logfile:
      new_name = nn;
      old_name = nn;
      
      submission_edited = 0;
      global_count++;
      
      // Insert data for server logfile:
      InsertServerLogData('cpts_not_modified');
      
      // Insert data into XML:
      var html_str = '<object>';
      html_str += '<name>' + new_name + '</name>';
      html_str += '<deleted>0</deleted>';
      html_str += '<verified>0</verified>';
      if(use_attributes) {
        html_str += '<occluded>' + new_occluded + '</occluded>';
        html_str += '<taglist>'
        for(var i=0;i<new_attributes_list.length;i++)
        {
          if(new_attributes_list[i]!="")
              html_str += '<tag>' + new_attributes_list[i] + '</tag>';
        }
	      html_str +='</taglist>';
      }
      html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
      var ts = get_date(); // GetTimeStamp();
      html_str += '<date>' + ts + '</date>';
      html_str += '<id>' + anno.anno_id + '</id>';
      if (bounding_box){
          html_str += '<type>'
          html_str += 'bounding_box';
          html_str += '</type>'
        } 
      if(anno.GetType() == 1) {
        
        
	/*************************************************************/
	/*************************************************************/
	// Scribble: Add annotation to LM_xml:
	html_str += '<segm>';
	html_str += '<username>' + username + '</username>';
	
	html_str += '<box>';
	html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>'; 
	html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
	html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>'; 
	html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
	html_str += '</box>';
	
	html_str += '<mask>'+ scribble_canvas.image_name +'</mask>';
	
	html_str += '<scribbles>';
	html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>'; 
	html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
	html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>'; 
	html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
	html_str += '<scribble_name>'+ scribble_canvas.scribble_name +'</scribble_name>'; 
	html_str += '</scribbles>';
	
	html_str += '</segm>';
	html_str += '</object>';
	$(LM_xml).children("annotation").append($(html_str));
	/*************************************************************/
	/*************************************************************/
      }
      else {
	html_str += '<polygon>';
	html_str += '<username>' + username + '</username>';
	for(var jj=0; jj < draw_x.length; jj++) {
	  html_str += '<pt>';
	  html_str += '<x>' + draw_x[jj] + '</x>';
	  html_str += '<y>' + draw_y[jj] + '</y>';
	  if (anno.time_point != null){
	  html_str += '<time>' + anno.time_point[jj] + '</time>';
	  }
	  html_str += '</pt>';
	}
	html_str += '<closed_date>' + anno.closing_time + '</closed_date>';
	html_str += '</polygon>';
	html_str += '</object>';
	$(LM_xml).children("annotation").append($(html_str));
      }
      
      
      if(!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml)-1, 'deleted') ||view_Deleted) {
	main_canvas.AttachAnnotation(anno);
	anno.RenderAnnotation('rest');
      }
      
      /*************************************************************/
      /*************************************************************/
      // Scribble: Clean scribbles.
      if(anno.GetType() == 1) {
      	scribble_canvas.cleanscribbles();
      	scribble_canvas.scribble_image = "";
      	scribble_canvas.colorseg = Math.floor(Math.random()*14);
      }
      /*************************************************************/
      /*************************************************************/

      if (add_parts_to != null) addPart(add_parts_to, anno.anno_id);
      // document.body.style.background = "#4457C0"
      // document.body.style.opacity = "0.3" 
      // document.getElementById('info').style.display = "block"
      // document.getElementById('info').innerHTML = "Storing into database"
      // document.getElementById('rotator').style.display = "block"
      // document.getElementById('establishment').style.display = "block"
      document.getElementById('submit_button').style.display = 'inline-block';
      WriteXML(SubmitXmlUrl,LM_xml,function(){
        console.log('step3')
        image_nm = window.location.href.split("&")[3].split("=")[1]
        console.log(window.location.href)
        console.log(image_nm)           
      // document.body.style.background = "unset"
      // document.getElementById('info').style.display = "none"
      // document.getElementById('rotator').style.display = "none"
      // document.getElementById('establishment').style.display = "none"
     // document.body.style.opacity = "1" 
      CloseQueryPopup();
        // setTimeout(() => {
        //   document.getElementById('train_model_loader').href = "/wdb_loader?ann="+new_name.toString()+"&im="+image_nm.toString()
        //   document.getElementById('train_model_loader').click()
        // }, 500);
          // return 
        return;
        });
      
      if(view_ObjList) RenderObjectList();
      
      var m = main_media.GetFileInfo().GetMode();
      if(m=='mt') {
      	document.getElementById('object_name').value=new_name;
      	document.getElementById('number_objects').value=global_count;
      	document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe_' + username + '&mode=i&folder=' + main_media.GetFileInfo().GetDirName() + '&image=' + main_media.GetFileInfo().GetImName();
      	if(global_count >= mt_N) document.getElementById('mt_submit').disabled=false;
      }
      console.log(anno)
      return anno;
    };
    
    // Handles when we wish to change from "query" to "rest".
    this.QueryToRest = function () {
        active_canvas = REST_CANVAS;

	// Move query canvas to the back:
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;

	// Remove polygon from the query canvas:
	if(query_anno) query_anno.DeletePolygon();
	var anno = query_anno;
	query_anno = null;
  
	//CloseQueryPopup();
	main_media.ScrollbarsOn();

        return anno;
    };
    
    // Handles when the user presses a key while interacting with the tool.
    this.KeyPress = function (event) {
        // Delete event: 46 - delete key; 8 - backspace key
        if(((event.keyCode==46) || (event.keyCode==8)) && !wait_for_input && !edit_popup_open && !username_flag) {
            // Determine whether we are deleting a complete or partially
            // complete polygon.
            if(!main_handler.EraseSegment()) DeleteSelectedPolygon();
        }
        // 27 - Esc key
        // Close edit popup if it is open.
        if(event.keyCode==27 && edit_popup_open) StopEditEvent();
    };
    
    // Handles when the user erases a segment.
    this.EraseSegment = function () {
        if(draw_anno && !draw_anno.DeleteLastControlPoint()) {
            submission_edited = 0;
            StopDrawEvent();
        }
        return draw_anno;
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
}