function build_model(){
    var annotation_text = document.getElementById('annotation_text').value;
   // var image_nm = window.location.href.split("&")[3].split("=")[1];
    
   document.getElementById('build_model_button').style.display = 'inline-block'
    $.ajax({
          type: "POST",
          url: "https://services.iittp.ac.in/annotator/train",
          data: annotation_text,
          contentType: "text/xml",
          dataType: "text",
          success: function func(data)
          {
              response = data.split(",")
            //   response = "true,".split(",")
              document.getElementById('response_message').style.display = 'block'
                if(response[0] == "false")
                {
                    document.getElementById('response_message').innerHTML = "Model <i><b>" + annotation_text + "</b></i> cannot be built at the moment. Add more training data!"
                    document.getElementById('response_message').style.color = 'red'
                }
                else {
                    document.getElementById('response_message').innerHTML = "Successfully trained Model <i><b>" + annotation_text + "</b></i>. You can auto-annotate"
                    document.getElementById('response_message').style.color = 'green'
                    //response[1] = "the,an,has"
                }
                document.getElementById('display_models').innerHTML = ""
                    for(var i=1;i<response.length;i=i+1)
                    {
                        document.getElementById('display_models').innerHTML += `<div class="toggle-container" style="display: inline;">
                        <input type="checkbox" name="`+ response[i] +`" id="`+ response[i] +`" class="toggle" />
                        <label for="`+ response[i] +`" class="label"><div class="ball"></div></label>
                        <span style="font-size: 1.5rem;">`+ response[i] +`</span>
                        </div>`
                    }
                document.getElementById('build_model_button').style.display = 'none'
                return ;},
          error: function(xhr,ajaxOptions,thrownError) {
            console.log('Failed to execute train model')
            console.log(xhr.status);          
            console.log(thrownError);
          }
        });
}
// function exec() {
//     $.ajax({
//     type: "POST",
//     url: "/get_existing_models",
//     data: '',
//     contentType: "text/xml",
//     dataType: "text",
//     success: function func(data)
//     {
//           if(data == "false"){
//                 continue;
//           }
//           else{
//                var response = data.split(",")     
//                 document.getElementById('display_models').innerHTML = ""
//                 if(response.length > 0){
//                       document.getElementById('response_info').innerHTML = response
//                       for(var i=1;i<response.length;i=i+1)
//                       {
//                             document.getElementById('display_models').innerHTML += `<div class="toggle-container" style="display: inline;">
//                             <input type="checkbox" name="`
//                             + response[i] +
//                             `" id="`
//                             + response[i] 
//                             +`" class="toggle" />
//                             <label for="`
//                             + response[i] 
//                             +`" class="label"><div class="ball"></div></label>
//                             <span style="font-size: 1.5rem;">`
//                             + response[i] 
//                             +`</span></div>`
//                       }
//                       document.getElementById('display_models').innerHTML += `<script>function get_model_names(){`
//                       document.getElementById('display_models').innerHTML += `<button onclick="javascript:ShowModelAnnotations(get_model_names())">
//                                                                        Auto Annotate <div id="auto_annotating" class="loader_done" style="display: none;"></div></button>`
//                 }
//                 else{
//                       document.getElementById('models_unavailable').style.display = 'block'
//                 }     
//           }
//           document.getElementById('checking_model_availability').style.display = 'none'
//           return ;},
//     error: function(xhr,ajaxOptions,thrownError) {
//           console.log('Failed to execute train model')
//           console.log(xhr.status);          
//           console.log(thrownError);
//     }
//     });
    
// }
// function get_model_names(){
//     var response = document.getElementById('response_info').innerHTML
//     var models_selected = ""
//     if(response == '')
//     {
//           continue;
//     }
//     else {
//     for(var i=1;i<response.length-1;i=i+1)
//                 {
//                       if(document.getElementById(response[i]).checked){
//                                         models_selected += response[i] + ","
//                                   }
//                 }
//                       if(document.getElementById(response[response.length-1]).checked){
//                                         models_selected += response[response.length-1]
//                                   }
//                 console.log(models_selected)                                                                                                                             
//     }   
//     return models_selected;          
// }