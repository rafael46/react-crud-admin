import React from 'react';
import Admin from "./admin.js";
import '../public/main.css';
import Form from "react-jsonschema-form";
import moment from "moment";

let search= function(term,queryset)
{
	
	let filtered_queryset=[];
	for(var object of queryset)
	{
	    if(object.name.search(new RegExp(term,"i"))>=0)
	    {
		filtered_queryset.push(object)

	    }
	    
	}
	return filtered_queryset;
}

let form_submit=function(form)
    {
	let contact=form.formData;

	if(form.edit)
	{
	    
	    this.state.queryset.splice(this.state.queryset.indexOf(this.state.object),1,contact);
	    this.response_change();
	}
	else
	{
	    this.state.queryset.push(contact);
	    this.response_add();
	}
    }

var data=[
	    {id: 1, name: 'Ken Next', number: '08939303003',address:{ street: "Hallmark Street"}},
    {id: 2,name: 'Isa Yoll', number: '0908839202',address:{ street: "Barbican Street"}},
     {id: 3, name: 'Jon Snow', number: '078890089',address:{ street: "Hallmark Street"}},
    {id: 4,name: 'Tom East', number: '07839030300',address:{ street: "Barbican Street"}}
];
function get_form(object=null)
    {
	let schema = {
	    title: this.name,
	    type: "object",
	    required: ["name"],
	    properties: {
		id: {type: "number", title: "id", default: Math.floor(1000*Math.random())+1 },
		name: {type: "string", title: "Name", default: ""},
		number : {type: "string", title: "Number", default: ""},
		address : {type: "object", title: "Address", properties : {
		street : { type : "string",title : "Street"}
		}}
	    }
	};
	if(!object)
	{
	    return <Form schema={schema}  onSubmit={this.form_submit.bind(this)} />
	}
	else
	{
	    return <Form schema={schema}  formData={object}  onSubmit={this.form_submit.bind(this)} />
	}
    }




function    get_header_transforms()
    {
	return { 'name' : function(header)
  	                  {
                              return 'Contact '+header
                          }
               }
    }
function    get_field_transforms()
    {
	return { name : function(content,object)
  	         {
		    
                              return content.toLowerCase()
                          }
               }
    }
function     get_extra_fields()
     {
      return { 'now' : function(object,label)
                        {
                           return moment(new Date()).format('LLL');
                         }
              }
     }
function    get_actions()
    {
	return { "delete" : (selected_objects)=>{
	    let total=data.length;
	    for(let object of selected_objects)
	    {
		data.splice(data.indexOf(object),1);

	    }
	    this.set_queryset(data);
	    this.set_total(total-selected_objects.length)
	}}

    }
function    get_filters()
    {
      return 	{
	"by_street_name" : { "options" : [
            { value: 'Hallmark Street', label: 'Hallmark Street' },
	    { value: 'Barbican Street', label: 'Barbican Street' },

		
	    ],
	     "filter_function" : (option,queryset)=>
	     {

		 let grouped= _.groupBy(queryset,'address.street');

		 return _.has(grouped,option.value) ? grouped[option.value] : [] ;
	     }
			   },

		"by_id" : {
			      "options" : [
                      { value: 'even', label: 'even' },
	              { value: 'odd', label: 'odd' },

		
	              ],	
	       "filter_function" : (option,queryset)=>
	             {

		        let grouped= _.groupBy(queryset,(contact)=>{
			    return contact.id % 2 ==0 ? "even" : "odd" ;
                        });

		         return _.has(grouped,option.value) ? grouped[option.value] : [] ;
	              }
	     }
					

      }


    }
let name='Contact';
let name_plural='Contacts';
let list_display_links=['name'];
let list_display=['id','name','number','address.street','now']


    

 class Example extends Admin
{
    constructor(props)
    {
	super(props)
    }


}


const exampleComponent=function(){
                        return <Example
			   queryset={data}
			   search={search}
			   form_submit={form_submit}
			   get_form={get_form}
			   get_header_transforms={get_header_transforms}
			   get_field_transforms={get_field_transforms}
			   get_extra_fields={get_extra_fields}
			   get_actions={get_actions}
			   get_filters={get_filters}
			   name={name}
			   name_plural={name_plural}
                           list_display={list_display}
    			   list_display_links={list_display_links}
			   />;
			 }
export default exampleComponent;
