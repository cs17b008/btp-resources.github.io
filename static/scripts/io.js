/** @file Input/output functions for writing annotation files to the LabelMe server. */

function ReadXML(xml_file,SuccessFunction,ErrorFunction) {
  $.ajax({
    type: "GET",
    url: "https://services.iittp.ac.in/annotator/"+xml_file,
    dataType: "xml",
    success: SuccessFunction,
    error: ErrorFunction
  });
}

function WriteXML(url,xml_data,SuccessFunction,ErrorFunction) {
  console.log(url)
    oXmlSerializer =  new XMLSerializer();
    sXmlString = oXmlSerializer.serializeToString(xml_data);
        
    // use regular expressions to replace all occurrences of
    sXmlString = sXmlString.replace(/ xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\"/g, "");
                                    
                        
    $.ajax({
    type: "POST",
    url: "https://services.iittp.ac.in/annotator/"+url,
    data: sXmlString,
    contentType: "text/xml",
    dataType: "text",
    success: SuccessFunction,
    error: function(xhr,ajaxOptions,thrownError) {
      console.log('Failed submit.cgi')
      console.log(xhr.status);          
      console.log(thrownError);
    }
  });
}
