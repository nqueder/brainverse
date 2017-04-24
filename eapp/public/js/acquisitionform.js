let saveObj = {}
let selectedFields =[]
$('[data-toggle="tooltip"]').tooltip()

$.ajax({
  type: "GET",
  url: "http://localhost:3000/acquisitions/forms",
  accept: "application/json",
  success: function(data){
    console.log('acquistions forms:success', data)
    //let dE = JSON.parse(data)
    let tforms = data.list
    if(tforms.length == 0){
      console.log("no forms")
      $("#term-form").empty()
    }else{
      for (let i=0;i<tforms.length;i++){
          console.log(tforms[i])
          if(tforms[i] != ".DS_Store"){
            $("#tforms").append('<option value="'+ tforms[i]+'">'+ tforms[i] +'</option>')
          }
          //count++
      }
    }
  }
})

$("#tforms").change(function(){
  console.log($("#tforms").val())
  $("#ndar-fields").empty()
  addAqFields($("#tforms").val())
})

function addAqFields(formName){
  //check if form is in local storage
  //let termform = JSON.parse(localStorage.getItem('termform'))
  let termform = JSON.parse(localStorage.getItem(formName))
  console.log("selectedFields",termform)

  let url = "http://localhost:3000/acquisitions/forms/" + formName

  // if the file is not in localstorage, read from the disk
  if(termform == null){

    $.ajax({
      type: "GET",
      url: url,
      accept: "application/json",
      success: function(data){
        console.log('acquistions term forms:success', data)
        termform = data
        add_term_to_form(termform)
      }//data
    })
  } else{
    add_term_to_form(termform)
  }

}//end of addAqFields function

function add_term_to_form(termform){
  selectedFields = termform['fields']
  console.log(selectedFields.length)
  //console.log("x",x.length)

  for (let i=0; i<selectedFields.length; i++){
    let sid = "ndar-"+i
    let options = []
    let sub_options1 = []
    let nvalues = []
    let notes = checkNotes(selectedFields[i].name,selectedFields[i].notes)
    if(notes != null){
      nvalues = Object.keys(notes).map(function(key) {
          return notes[key]
          })
    }

      if(selectedFields[i].valueRange == null){
        /* Case1: No Value Range */
        $("#ndar-fields").append('<div class="form-group">\
        <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
        <div>\
        <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
        </div>\
        </div>')
      }else if (selectedFields[i].valueRange.indexOf(';')> -1){
        /*  Case 2:
        if valueRange specified with ';' separator
            check notes if values with its meaning specified in the notes
            if notes is empty then parse valueRange field
            otherwise parse notes field and obtain values representation, e.g (1 = "xyz"; 2 = "utty")
         */
         let sub_options2 = []
          options = selectedFields[i].valueRange.split(';')
          //if(notes== {}){
          //  options = selectedFields[i].valueRange.split(';')
          //} else
          //if((notes != null) && (Object.values(notes).length ==  options.length)){
          //  options = Object.values(notes)
          //}
          console.log("c2::options::", options)
          console.log("c2::options.length::", options.length)
          $("#ndar-fields").append('<div class="form-group">\
            <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
            <div>\
              <select class="form-control" id="ndar-'+i+'">\
              <option value="nsource">Select</option>\
              </select>\
            </div>\
          </div>')

          //console.log(sid)
          for (let j=0; j< options.length; j++){
            console.log("Adding",options[j])
            if(options[j].indexOf("::")> -1){
              let sub_options = options[j].split("::")
              for(let k=sub_options[0];k<=sub_options[1];k++){
                //$("#"+sid).append('<option value="'+ k+'">'+ k +'</option>')
                sub_options2.push(k)
              }
            }else{
              sub_options2.push(options[j])
              //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
            }
          }
          //if((notes != null) && (Object.values(notes).length ==  sub_options2.length)){
          if((notes != null) && (nvalues.length ==  sub_options2.length)){
            //options = Object.values(notes)
            options = nvalues
            for(let m=0;m<options.length;m++){
              $("#"+sid).append('<option value="'+ options[m]+'">'+ options[m] +'</option>')
            }
          }else{
            for(let m=0;m<sub_options2.length;m++){
              $("#"+sid).append('<option value="'+ sub_options2[m]+'">'+ sub_options2[m] +'</option>')
            }
          }


        } else if (selectedFields[i].valueRange.indexOf("::")> -1){
          /*
          Case3: valueRange of the form - 0::3
          check notes - parse notes

          */
          flag = false
          if(notes == {}){
            sub_options1 = selectedFields[i].valueRange.trim().split("::")

          } else{
            //sub_options1 = Object.values(notes)
            sub_options1 = nvalues
            console.log("c3::sub_options1:: ", sub_options1)
            console.log("c3::sub_options1.length:: ", sub_options1.length)
            //console.log("notes: ", notes)
            if(sub_options1.length == 1){
              sub_options1 = selectedFields[i].valueRange.trim().split("::")
            }
            //console.log(":: ",sub_options1)
          }

            console.log("c3-1::sub-options1:: ",sub_options1)
            console.log("c3-1::sub_options1.length:: ", sub_options1.length)

            if(sub_options1[1].trim()>20){
              $("#ndar-fields").append('<div class="form-group">\
              <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
              <div>\
              <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
              </div>\
              </div>')
            }else{
            $("#ndar-fields").append('<div class="form-group">\
              <label for="ndar-'+i+'" data-toggle="tooltip" title="'+ selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
              <div>\
                <select class="form-control" id="ndar-'+i+'">\
                <option value="select">Select</option>\
                </select>\
              </div>\
            </div>')

            if(notes == null || notes.hasOwnProperty(selectedFields[i].name)){
              for(let m=sub_options1[0].trim();m<sub_options1[1].trim();m++){
                $("#"+sid).append('<option value="'+ m+'">'+ m +'</option>')
              }
            }else{
              for(let m=0;m<sub_options1.length;m++){
                $("#"+sid).append('<option value="'+ sub_options1[m]+'">'+ sub_options1[m] +'</option>')
              }
            }
          }
          }
          else{
            //$("#"+sid).append('<option value="'+ options[j]+'">'+ options[j] +'</option>')
            $("#ndar-fields").append('<div class="form-group">\
            <label for="ndar-'+i+'" data-toggle="tooltip" title="'+selectedFields[i].name+'">'+selectedFields[i].description+'</label>\
            <div>\
            <input class="form-control" type="text" placeholder="'+selectedFields[i].valueRange+'" id="ndar-'+i+'">\
            </div>\
            </div>')
          }

    }//end of outermost for

    $("#ndar-fields").append('<div class="form-group">\
    <label for="ndar-'+selectedFields.length+'" data-toggle="tooltip" title="ExperimentID">ExperimentID</label>\
    <div>\
    <input class="form-control" type="text" placeholder="ExperimentID" id="ndar-'+selectedFields.length+'">\
    </div>\
    </div>')
}

function saveAqInfo(e){
  e.preventDefault()
  saveObj['objID'] = ''
  for (let i=0; i<=selectedFields.length; i++){
    //let lb =$('label[for="ndar-' + i + '"]').html()
    let lb=$('label[for="ndar-' + i + '"]').attr('title')
    console.log('lb1:', lb)
    saveObj[lb] = $("#ndar-"+ i).val()
    console.log('saveObj[lb]:',saveObj[lb])
  }

  console.log(saveObj)
  //Save the data entered
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/acquisitions/new",
    contentType: "application/json",
    data: JSON.stringify(saveObj),
    success: function(data){
      console.log('success')
      //$("#div-projectFields").empty()
      $("#termsInfoSaveMsg").empty()
      $("#terms-list").empty()
      $("#terms-back").empty()

      $("#termsInfoSaveMsg").append('<br><div class="alert alert-success fade in" role="alert">\
      <a href="#" class="close" data-dismiss="alert">&times;</a>\
  <strong>Aquisition Object Saved in uploads/acquisition/'+ data['fid']+'!</strong>\
</div>')
      $("#termsInfoSaveMsg").append('<br>')
      $("#terms-list").append('<button id= "btn-pj-list" class="btn btn-primary">Fill up Another Form </button><br>')
      $("#terms-back").append('<button id= "btn-back" class="btn btn-primary">Back To Main Page </button>')
    }
  })
  console.log('done')
}
function projectListPage(){
  window.location.href = "http://localhost:3000/acquistionForm.html"
}

function mainpage(){
  window.location.href = "http://localhost:3000"
}
$('#btn-aqInfoSave').click(saveAqInfo)
$('#terms-list').click(projectListPage)
$('#terms-back').click(mainpage)

function checkNotes(key,notes){
  let values = {}
  if(notes != null){
    let options = notes.split(';')
    for(let i = 0;i < options.length; i++){
      let value = options[i].split('=')
      if(value.length<2){
        //values[value[0]] = key
        values[key] = value[0]
      } else{
        //values[value[1]] = value[0]
        values[value[0]] = value[1]
      }
    }
    return values
  } else {
    return {}
  }
}


function addModal(mbody){
  <!-- Modal -->
$("#modal").append('<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">\
  <div class="modal-dialog" role="document">\
    <div class="modal-content">\
      <div class="modal-header">\
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\
          <span aria-hidden="true">&times;</span>\
        </button>\
      </div>\
      <div class="modal-body">\
        '+ mbody +'\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\
        <button type="button" class="btn btn-primary">Save changes</button>\
      </div>\
    </div>\
  </div>\
</div>')
}
