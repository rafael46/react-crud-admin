import React from 'react';
import _ from 'lodash';
import Set from './set.js';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
const uuidv1 = require('uuid/v1');

export const display_type = {
    list : "list",
    change : "change"
};

/** Admin Class extends React.Component. To implement a CRUD interface similar to Django Admin you need to extend the Admin class. */
class Admin extends React.Component {
    
    constructor(props)
    {
	
	super(props);

	this.name='default'
	this.name_plural='defaults'
	this.live_search=false
	this.field_transforms={}
	this.header_transforms={}
	this.extra_fields={}
	this.list_display=[]
	this.list_display_links=[]
	this.list_per_page=10
	this.sort_fields=[]
	this.is_object_equal=(a,b)=> a==b
	this.pages_in_pagination = 3
	this.actions={
	    "delete" : (selected_objects)=>{
		
	    }
	}
	
	this.queryset=[]
	this._all_selected=false
	this.register_listener()
	if(props)
	{
	    this.bind_exclude= props.bind_exclude ? props.bind_exclude : []
	    _.keys(props).map((key)=>{
		if(typeof props[key] == "function")
		{
		    if(_.includes(key,this.bind_exclude))
		    {
			this[key] = props[key]
			
			this[key].bind(this);
		    }
		}
		else
		{
		    this[key]=props[key];
		}
		
	    });
	}

	/**
	 * Initialize the state of the component
	*/
	this.state = {display_type : display_type.list ,  page_number : 1,object : null,selected_objects:new Set([],this.is_object_equal),total:1,filter_options:{},filter_values:[]}

	
        let queryset=this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset) ? this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset) : [] ;
        this.state.queryset=queryset;
	this.state.total=queryset.length;
	this._handle_search = this._handle_search.bind(this);
	this._select_all = this._select_all.bind(this);
	this._select_one=this._select_one.bind(this);
	this.response_change = this.response_change.bind(this);
	this.response_add = this.response_add.bind(this);

    }
     /**
     * This function returns an array of objects that will serve as the
     * queryset for the admin interface. Typically involves an HTTP request
     * to a backend.
     * @param {number} page_number - The current page number
     * @param {number} list_per_page - Number items to list per page. Defaults to `list_per_page`
     * @param {object[]} queryset - The current queryset
     * @returns {object[]} An array of objects. - Objects to display
     */

    get_queryset(page_number=this.state.page_number,list_per_page=this.list_per_page,queryset=this.state.queryset)
    {
    

	return this.queryset;
    }

    
    /**
     * This functions returns a JSON Schema Form for editing
     * the objects in the array returned by get_queryset(). This method needs to be overridden to
     * so as to return a Form Component for the object.  Learn more on 
     * JSON schema forms from https://github.com/mozilla-services/react-jsonschema-form 
     * and JSON Schema from https://spacetelescope.github.io/understanding-json-schema/
     * @param {object} object - The current selected object.
     * @returns  A JSON Schema Form Component.
     */

    get_form(object=null)
    {
	
	return {}
    }
    /**
     * Returns a true/false value. Controls wether search is implement on live input or not.
     * Can be overriden by the live_search member variable. Default is false.
     *
     *@return {boolean} 
     */

    get_live_search()
    {

	return this.live_search;
	
    }

    /**
     *Returns an object whose properties are field names corresponding to properties of any object 
     *in the queryset and whose values are transform functions. The example below will transform each "name"
     *property of objects in the queryset to upper case in the list display view.
     *@example
     *get_field_transforms()
     *{
     * return { 'name' : function(name,object)
     *                   {
     *                       return name.toUpperCase()
     *                   }
     *         }
     *
     *}
     *@return {object} 
     */

    get_field_transforms()
    {
	if(this.field_transforms)
	{
	    return this.field_transforms
	}
	return {}
	
    }

    /**
     *Returns an object whose properties are field names corresponding to properties of any object 
     *in the queryset and whose values are transform functions. The example below will transform the header "name" to upper case in the list display view.
     *@example
     *get_header_transforms()
     *{
     * return { 'name' : function(name)
     *                   {
     *                       return name.toUpperCase()
     *                   }
     *         }
     *}
     *
     *@return {object} 
     */

    get_header_transforms()
    {
	if(this.header_transforms)
	{
	    return this.header_transforms;
	}
	
	return {}
	
    }

    /**
     * Returns an object whose properties are extra  field names not corresponding to properties of any object 
     * in the queryset and whose values are display functions. This will create extra fields that are not tied to objects. Extra fields have to be manually included in the `list_display` in order to appear in the list display page. The display functions take the current object being rendered in the table row and  the field name
     *@example
     *get_extra_fields()
     *{
     * return { 'now' : function(object,label)
     *                   {
     *                      return moment(new Date()).format('LLL');
      *                   }
     *         }
     *}
     *
     *@return {object} 
     */

    get_extra_fields()
    {
	if(this.extra_fields)
	{
	    return this.extra_fields;
	}
	
	return {}
	
    }
     /**
	* Returns the number of items to be listed in a page. Can be overridden by `list_per_page`.
         *@return {number} The number of objects in a page 
     */

    get_list_per_page()
    {
	if(this.list_per_page)
	{
	    return this.list_per_page
	}
	return 10
    }
	   
    /**
     * Gets an actions object whose properties are action names and values are action methods.
     * This can be overridden by the action member variable. The default "delete" method is not
     * implemented.
     *
     * Each actions object property (e.g. "delete") is passed an array of selected objects. One
     * can then handle those objects. Actions will appear on the list display page within a
     * dropdown. Selecting an action should have the action method applied to all currently 
     * selected objects.
     * @example
     *
     * actions = { "delete" : (selected_objects)=>{ } }

     *@return {object} An actions object
     */
    
    get_actions()
    {

	if(this.actions)
	{
	    return this.actions;
	}
	
	return {}


    }
    /**
     *   Gets the list/array of properties of the objects in the queryset that are clickable
     *    when displayed on the list display page. It can be overridden by the member variable
     *   `list_display_links`. A property is any string that should exist as a property in the objects within 
     *   a queryset and works with lodash's `_.at` function. 
     *
     *   The properties "name","address.street" and "emails[0]" are all acceptable by `_.at` in the example below
     *   @example
     *   let object={ name : "any name",{ address : { street : "any"}},emails: ["any@any.com"]}
     *  
     * 
     *
     * @return {string[]} A list of properties of the object to be displayed
     */

    get_list_display_links()
    {

	if(this.list_display_links)
	{
	    return this.list_display_links;
	}
	return [];
    }
/**
     *   Gets the list/array of properties/field names of the objects in the queryset to be
     *   displayed on the list display page. It can be overridden by the member variable
     *   list_display. A property is any string that should exist in the objects within 
     *   a queryset and works with lodash's _.at function. See more at
     *   https://lodash.com/docs/#at 
     *
     *   @example
     *   let object={ name : "any name",{ address : { street : "any"}},emails: ["any@any.com"]}
     *  
     *   The properties "name","address.street" and "emails[0]" are all acceptable
     *
     * @return {string[]} A list of properties of the object to be displayed 
     */

    get_list_display()
    {
     
	if(this.list_display)
	{
		return this.list_display;

	}
	return []
	
    }
    /**
     * Returns an ordered queryset. The method checks to see if sorting is active and sorts
     * the current queryset based on the sort order. 
     * @private
     * @return {object[]} An ordered queryset 
     */


    _get_ordered_queryset()
    {

	if(this.sort_fields.length>0)
	{
	    
	    return this.sort_by(this.sort_fields,this.state.queryset) 
	}

	return this.state.queryset ?  this.state.queryset : [];

    }
    /**
     * Implements search. This method should be overridden to implement a custom search
     *
     *@param {string} term - the search term
     *@param {object[]} queryset - the current queryset
     *@return {object[]} the queryset as a result of the search
     */

    
    search(term,queryset)
    {
	return queryset
    }
    /**
     * Grants permission to delete object. This method is not implemented and can be handled via
     *  implementing actions.
     *
     *@param {object} object - 
     *@return {boolean} Returns true is the object has been deleted or false otherwise
     */

    has_delete_permission(object)
    {
	
        return true
    }
    /**
     * Grants permission to add an object. This method controls rendering of the Add 
     * button
     *
     *
     *@return {boolean} Returns true is the object can be added or false otherwise
     */

    has_add_permission()
    {
	return true;
    }
    /**
     * Grants permission to change an object. It disables all links to the add/change page when
     * enabled
     *
     *@return {boolean} Returns true is the object can be changed or false otherwise
     */

    has_change_permission(object=null)
    {
	return true
    }
    /**
     * Grants permission to the this admin interface. 
     *
     *@return {boolean} Returns true if access is allowed false otherwise
     */

    has_module_permission()
    {
	return true
    }
    /*
    _order_state(field)
    {

	let index=_.findIndex(this._sort_fields,item=> item.hasOwnProperty(field));
	
	if(index<0)
	{
	    return 'sort-not-active';

	}
	if(this._sort_fields[index][field]=='desc')
	{
	   
	    return 'sort-reverse-active';
	}
	return 'sort-active';
	}*/

    /**
     * This method adds up/down arrows to field headers on the list display page table
     *
     * @private 
     * @param {string} field -  the field/property name
     
     
     */   


    _order_state_arrow(field)
    {

	let index=_.findIndex(this.sort_fields,item=> item.hasOwnProperty(field));
	
	if(index<0)
	{
	    return null;

	}
	if(this.sort_fields[index][field]=='desc')
	{
	   
	    return <span>&#8681;</span>
	}
	return  <span> &#8679;</span>
    }
    /**
     *  This method  should be overriden and called after saving an object in the add/change view.       *  This method is not called at all here but provides hints on what to do after saving
     *  an object. Change the state display_type to "list", object to "null" and refresh the quer         *  yset.
     */   
    
    response_add()
    {
	this._display_will_change()
	this.setState({display_type :display_type.list, object :null,queryset: this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset)  },this._display_changed);

	return true
    }
    /**
     *  This method should be overriden and called after saving an object in the add/change view.         *  This method is not called at all here but provides hints on what to do after saving
     *  an object. Change the state display_type to "list", object to "null" and refresh the quer         *  yset.
     */   

    response_change()
    {
	this._display_will_change()
	this.setState({display_type :display_type.list, object :null,queryset: this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset)  },this._display_changed);
	
	return true
    }
    /**
     * A private method to wrap a table entry in an <a></a> tag in the display page.
     * The method checks if permission is given to display links using the has_change_permission method
     * @private
     * @param {object} object - the current object to be displayed as a table
     * entry in the display page
     * @param {string} label - the name of the field 
     
     */
   
    _create_object_link(object,label)
    {
	if(this.has_change_permission(object))
	{
	    return <a onClick={this._object_link_clicked(object)} href="#"> {label} </a>
	}
	else
	{
	    return <span> {label} </span>
	}
    }
    
    set_queryset(queryset)
    {
	
	this.setState({queryset : queryset})

    }
    
    set_total(total)
    {
	
	this.setState({total : total})

    }
    
    
    _get_prop_label(label)
    {
	let labels=label.split('.');
	return labels[labels.length-1];
    }
    _get_table_header()
    {
	return this.get_list_display().map((item)=>
	{
	    return <th key={item}  onClick={this._sort_handler(item)} > { this.get_header_transforms()[item] ? this.get_header_transforms()[item](item): _.startCase(this._get_prop_label(item))}{    this._order_state_arrow(item)} </th>
	})

    }
    _display_changed()
    {
	this.display_changed(this.state.display_type,this.state.object)

    }
    /**
     * An event listener that listens to state changes in the display type i.e.
     * from list to add/change. It is fired after state changes are made.
     * 
     * @param {string} display_type - the current display type of the component either "list" or "change" 
     * @param {object} object - the current object or null
     
     */

    display_changed(display_type,object)
    {

    }
    _display_will_change()
    {
	this.display_will_change(this.state.display_type,this.state.object)
    }
    /**
     * An event listener that listens to state changes in the display type i.e.
     * from list to add/change . It is fired before state changes are made.
     * 
     * @param {string} display_type - the current display type of the component either "list" or "change" 
     * @param {object} object - the current object or null
     
     */

    display_will_change(display_type,object)
    {

    }
    _object_link_clicked(object)
    {
	
	return (event)=>
	    {
		this._display_will_change()
		this.setState({display_type :display_type.change, object :object  },this._display_changed);
		event.preventDefault();
	}
    }

    _display_field(object,item)
    {
	
	let label=_.at(object,item)['0']
	
	if(_.has(this.get_field_transforms(),item))
	{
	    return this.get_field_transforms()[item](label,object)

	}

	if(_.at(this.get_extra_fields(),item))
	{
	    
	    if(this.get_extra_fields()[item])
	    {
		label=this.get_extra_fields()[item](object,item)
	    }
	    
	}

	return label;
    }
    
    set_filter_options(filter_name,options)
    {
	
	let t={}
	t[filter_name]= options.map((option)=>{ option._filter_ = filter_name; return option; });
	this.setState({ filter_options :  _.assign(this.state.filter_options,t)}    )

    }
    
    get_filter_values()
    {
	return this.state.filter_values;
    }
    get_filters()
    {
	/*
	return {

	    "by_id" : { "options" : [
			    { value: 'one', label: 'One' },
	    { value: 'two', label: 'Two' },

		
	    ],
	     "filter_function" : (option,queryset)=>
	     {


		 return queryset;
	     }
           }
	    
	}*/
    }
    _handle_filter_change(values)
    {
	if(!(values instanceof Array) && values!=null)
	{
	    values=[values];
	}

	this.setState({ filter_values : values || [] });
	
	if(values==null  || values.length<=0)
	{
	    this.set_queryset(this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset));
	    return
	}

	let filters=this.get_filters();
	for(let value of values)
	{
	    let queryset=filters[value._filter_].filter_function(value,this.state.queryset)
	    this.setState({queryset:queryset});
	}
    }
    render_filters()
    {

	let options=[];
	let filters=this.get_filters();
	for(let filter of _.keys(filters))
	{

	    options.push({label: _.startCase(filter),
			  value: filter,
			  disabled: true,
			  filter: null})
	    
	    if(filters[filter].options.length >0)
	    {
		for(let option of  filters[filter].options)
		{
		    option._filter_=filter;
		    options.push(option)
		}
	    }
	    if(this.state.filter_options[filter])
	    {
		for(let option of  this.state.filter_options[filter])
		{
		    option._filter_=filter;
		    options.push(option);
		}
	    }
	    
	}
    
	    
	return <div style={{marginLeft:"10px",width:"100%"}}>

	    
	    <Select
	name="filter-form"
	multi={true}
	onChange={this._handle_filter_change.bind(this)}
	closeOnSelect={true}
	value ={this.state.filter_values}
	removeSelected = {true}
	placeholder = {"Select a filter"}
	options={options}
	    />

	</div>
    }
    sort_by(sort_fields)
    {
	return this.state.queryset ? this.state.queryset : [];
    }

    _sort_handler(field)
    {

	return (event)=>
	{
	    
	    let index=_.findIndex(this.sort_fields,item=> item.hasOwnProperty(field));
	    if(index>=0)
	    {
		if(this.sort_fields[index][field]=='asc')
		{
		    this.sort_fields[index][field]='desc';

		    
		}
		else
		{
		    this.sort_fields=_.filter(this.sort_fields,item => !item.hasOwnProperty(field));
		    
		}

		
	    }
	    else
	    {
		let temp={}
		temp[field]='asc';
		this.sort_fields.push(temp);

	    }
	  
	    this.sort_by(this.sort_fields)
	    this.forceUpdate();

	}
    }
    /**
     * This method is an event handler that listens to when all objects of the queryset
     * displayed within a single display page are selected
     */   

    _select_all(event)
    {


	
	if(this._all_selected)
	{
	    
	    this.setState({selected_objects : new Set([],this.is_object_equal)});
	}
	else
	{
	    this.setState({selected_objects : new Set(this.state.queryset,this.is_object_equal)})
	    
	}
	this._all_selected=!this._all_selected;
	
    }
    /**
     * This method is an event handler that listens when a single objects of the queryset
     * displayed is selected
     */   

    _select_one(object)
    {

	return (event)=>{

	    if(this.state.selected_objects.contains(object))
	    {
		this.state.selected_objects.remove(object);

		this.setState({selected_objects : this.state.selected_objects});

	    }
	    else
	    {
		this.state.selected_objects.add(object);
		this.setState({selected_objects : this.state.selected_objects});


	    }

	}
    }

    /**
     * Generate the table body for the list display page
     *
     * @return  An array of table rows <tr/>
     */

    _get_table_body()
    {
	return this._get_ordered_queryset().map((object,i)=>
	    {
		return <tr key={"row-"+i}>
		<td>  <input type="checkbox" id={i+'_checkbox'} onChange={this._select_one(object)} checked={this.state.selected_objects.contains(object)}/> <label htmlFor={i+'_checkbox'}>&nbsp;</label> </td>
		{this.get_list_display().map((item)=>
		{
		    
		    return <td key={item} > { this.get_list_display_links().find((a)=>{return item==a}) ? this._create_object_link(object, this._display_field(object,item)) : this._display_field(object,item)}  </td>
		    
		    })}
		</tr>
	    })


    }
    /**
     * Changes the state property "loading" to true. The state property can be used to show a
     * progress indicator.
     */

    show_progress()
    {
	  

	this.setState({loading: true});
    }
    /**
     * Changes the state property "loading" to false. This method  can be used to hide a
     * progress indicator by inspecting the "loading" property of the state object.
     */

    hide_progress()
    {

	this.setState({loading: false});
    }
    /**
     * The default progress indicator. Can be overriden.
     * @return A progress indicator component
     */

    render_progress(loading)
    {
	if(loading)
	{

	    return <div className="fetch-progress" >
	            <progress>
	    	    </progress> 
	           </div>
	}
    }
    /**
     * An event listener that listens to the search event. This method calls search method which
     * implements a custom search. The method uses the "live_search" property to implement live 
     * search or not.
     * @private
     * @param {object} event The search onChange event
     */

    _handle_search(event)
    {
	let term=event.target.value;
	
	if(term)
	{
	    let key= event.which || event.keyCode;
	   
            if(this.get_live_search() || key===13)
	    {
		let queryset=this.search(term,this.state.queryset);
		this.setState({queryset:queryset,total:queryset.length})

	    }

	}
	else
	{
	    
	    this.setState({queryset:this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset),total:this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset).length})
	}
	

    }
    /**
     * Renders the search component
     * 
     * @return A search input field
     */

    render_search_field()
    {
	return 	<div >
	<input name="search" type="text" className="ra-search-field" placeholder="Search" onChange={this._handle_search}   onKeyUp={this._handle_search}/>
	</div>

    }
    /**
     * Renders the add object button. Checks to see if permission is given by has_add_permission
     * 
     * @return An add button component
     */

    render_add_button()
    {

	if(this.has_add_permission())
	{
		return <button className={"ra-add-button"} onClick={this._object_link_clicked(null)} > Add {_.startCase(this.name)}</button>
	}
    }
    /**
     * Renders the table in the display page. This calls _get_table_header and _get_table_body
     * 
     * @return An a table displaying the state queryset set objects
     */

    render_table()
    {

	return 	<table className="ra-margin-top-20 table table-hover">
	    
	    <thead>
	    
	       <tr key="header">
	          <th>
	             <input type="checkbox" id="all_boxes" onChange={this._select_all} />  <label htmlFor="all_boxes">&nbsp;</label>
	         </th>
		{this._get_table_header()}
	       </tr>
	    </thead>
	     <tbody>
		{this._get_table_body()}
	     </tbody>
	     </table>
	


    }
    /**
     * An event listener that listens to actions selected.
     * 
     *@param {object} event -  the DOM on-change event
     */


    action_selected(event)
    {
	
	let action=event.target.value;

	console.log(this.state.selected_objects.getItems())
	this.get_actions()[action](this.state.selected_objects.getItems());
	this.get_queryset(this.state.page_number,this.list_per_page);

	

    }
    /**
     * An event listener that listens when a page is  selected.
     * 
     *@param {number} page -  the page number selected
     */

    selectPage(page)
    {

	return (event)=>
	{
	
	    this.setState({page_number: page.page},()=>{

		this.setState({queryset: this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset)})

	    });
	    event.preventDefault();
	}



    }
    /**
     * An event listener that listens when the next page is  selected.
     * 
     */

    nextPage()
    {

	this.setState({page_number: Math.min(this.state.page_number+1,this.state.total)});
	    
	
    }
    /**
     * An event listener that listens when the previous page is  selected.
     * 
     */

    prevPage()
    {

	this.setState({page_number: Math.max(this.state.page_number-1,1)});
	    
	
    }
    /**
     * Renders the pagination UI
     * 
     * @return A component that renders the pagination controls
     */

    render_pagination()
    {

	let pages=[];
	if(this.state.total)
	{
	    let numpages=Math.ceil(this.state.total/this.list_per_page);
	    let pages_in_pagination= numpages < this.pages_in_pagination ? numpages : this.pages_in_pagination;
	    
	    if(this.state.page_number ==1)
	    {
		for(let i=0;i<pages_in_pagination;i++)
		{
		    pages.push(i+1);
		}
	    }
	    else if(this.state.page_number ==numpages)
	    {
		for(let i=0;i<pages_in_pagination;i++)
		{
		    pages.push(numpages-i);
		}


	    }
	    else
	    {

		
		for(let i=0;i<pages_in_pagination;i++)
		{
		    pages.push(this.state.page_number+i);
		}

	    }
		/*
		for(var i=0;i<numpages;i++)
	    {
		pages.push(i+1);

	    }*/
	    
	}

	return <div className="pull-right">
	    <span className="summary">{this.list_per_page*(this.state.page_number-1)+1 }-{Math.min(this.list_per_page*(this.state.page_number-1)+this.list_per_page,this.state.total)} of {this.state.total} </span>  

	<nav  aria-label="Page navigation">
	<ul className="pagination">
	<li  key={"left"} className="page-item">
	    <a href="#" aria-label="Previous" onClick={this.prevPage.bind(this)} className="page-link">
	<span aria-hidden="true">&laquo;</span>
	</a>
	    </li>
	    
	{pages.map((page)=>{
	    return <li key={page} className="page-item"><a href="#" className="page-link"  onClick={this.selectPage({page})}>{page}</a></li>
	})
	}
	<li className="page-item">
	    <a href="#" key={"right"} onClick={this.nextPage.bind(this)} aria-label="Next" className="page-link">
	<span aria-hidden="true">&raquo;</span>
	</a>
	</li>
	</ul>
	
	</nav>
	</div>
    }
    /**
     * Renders the actions select component
     * 
     * @return A component that renders a select input for all actions in the list display page
     */

    render_actions()
    {

	    
	return <select className="ra-action-button" onChange={this.action_selected.bind(this)} defaultValue="">
	    <option key="key" value="" disabled={true}>Choose an action</option>
     	{ _.keys(this.actions).map((action)=>{
	    return <option key={action} value={action}> {_.startCase(action)}</option> 

	    })}
	</select>
	
    }
    /**
     * Renders the back button component in the add/change view
     * @ignore
     * @return A component that renders a back button
     */


    render_back_button()
    {
	
//	return <div><button className={"ra-back-button"} onClick={()=>{this.setState({display_type : display_type.list,object: null });this.get_queryset(this.state.page_number,this.list_per_page,this.state.queryset); }}> Back </button></div>
	return null;

    }
    /**
     * Renders the admin interface component
     * 
     * @return A component that renders the admin interface
     */
    render_list_view()
    {
	return (
	       <div >
		
		    {this.render_add_button()}
	            {this.render_below_add_button()}
		    {this.render_search_field()}
		    {this.render_below_search_field()}
		    {this.render_actions()}
	            {this.render_below_actions()}
		    {this.render_filters()}
		    {this.render_below_filters()}
		
		    {this.render_table()}
		    {this.render_below_table()}
	            {this.render_progress(this.state.loading)} 
	            {this.render_below_progress()}
		
		    {this.render_pagination()}
		
		</div>
	    )
	    


    }
    render_below_add_button(){

    }
    render_below_search_field()
    {

    }
		
    render_below_actions()
    {


    }
		
    render_below_filters()
    {

    }
		
		
    render_below_table()
    {

    }
		
    render_below_progress()
    {

    }
		
		
    render_change_view()
    {
	return (<div>
	    {this.render_progress(this.state.loading)}
		{this.get_form(this.state.object)}
		</div>
	    )


    }
    render_above_change_view()
    {

    }
    render_below_change_view()
    {

    }
    render_above_list_view()
    {

    }
    render_below_list_view()
    {

    }
    render_list_page()
    {
	 return <div>
	        {this.render_above_list_view()}
	        {this.render_list_view()}
	        {this.render_below_list_view()}
	       </div>

    }
    render_change_page()
    {
	return <div>
	        {this.render_above_change_view()}
        	{this.render_change_view()}
	        {this.render_below_change_view()}
	       </div>


    }
    render()
    {
	if(!this.has_module_permission())
	{
	    return <div> <h1> Permission Denied </h1></div>
	}

	if(this.state.display_type == display_type.list)
	{
	    return this.render_list_page();
	}
	else
	{
	    //Important: the next two lines are for URL navigation and handling the browser back button
	    this._change_uuid=uuidv1();
	    history.pushState({}, "Change View", window.location.hash+"/change/"+this._change_uuid);

	    return this.render_change_page();
	}

	
    }
    show_list_view()
    {
	this._display_will_change()
	this.setState({display_type : display_type.list},this._display_changed)

    }

    register_listener()
    {
	this._hash_change_listener=(event)=> {
	    

	    if(this && this.state.display_type!=display_type.list && !_.endsWith(window.location.hash,this._change_uuid))
	    {
		this.show_list_view()
	    }

	    

	   
	}
	window.addEventListener("hashchange",this._hash_change_listener );
	

    }

    componentWillUnmount()
    {
	if(this._hash_change_listener){
	    window.removeEventListener("hashchange",this._hash_change_listener,true );}
    }

}




export default Admin;
