# Rails AJAX Validation

Rails AJAX Validation is a jQuery plugin to bring your forms to life. It gives your users useful real time feedback on their form. This plugin's defaults are designed for formtastic, but they shouldn't give you too many problems if you aren't using formtastic.

## How it Works

The plugin uses server side model validation so the data is being validated just as if the form were actually being submitted. This uses many XHR's. Form elements change event is bound to function that does an AJAX JSON request to the form's action with its method. The controller returns the errors in JSON. JSON is parsed into an array of errors for that field. Then the errors are displayed underneath the field.

## Configuration
Defaults:

* errorTextClass: 'inline-errors' //Class for p tag containing errors
* validClass: 'valid' //gets added to valid inputs
* invalidClass: 'invalid' //gets added to invalid inputs
  
Callbacks. Usually you won't have to modify these unless need more control of how errors are inserted into the DOM  

*  showErrors: function(field,errors) //field is a jQuery object for input, errors is an array 
*  removeErrors: function(field) //callback to remove error text
*  validField: function(field) //can be used to process valid fields


# An Example:

In order for this to work, our controller needs to respond to JSON. Here's an example from my app

## Controller

    # notice how the user is not saved in json requests since we are only interested in validity:
    def create
      @user = User.new params[:user]
  
      respond_to do |wants|
        wants.html do
          if @user.save
            flash[:notice] = "Your account has been saved."
            redirect_to @user
          else
            render :new
          end
        end
              
        wants.json do
          @user.valid?
          render :json => @user.errors;
        end
      end  
    end
  
## View
    <% semantic_form_for @user, :html => { :class => 'ajax-validation' } do |form| %>
    	<% form.inputs :name => 'This is all we need to know' do %>
    		<%= form.input :name, :label => 'Login' %>
    		<%= form.input :email %>
    		<%= form.input :password %>
    		<%= form.input :password_confirmation %>
    	<% end %>`

    	<%= form.commit_button 'Sign Up', :button_html => {:type => :image, :src => '/images/buttons/sign_up.png'} %>
    <% end %>
  
## Enable Validation
    $(function() {
      $('form.ajax-validation').railsAjaxValidation();
    });
  
# Default Settings
    errorTextClass: 'inline-errors',
    validClass: 'valid',
    invalidClass: 'invalid',
    showErrors: function(field,errors) {
    	field.after('<p class="'+this.errorTextClass+'" style="display:none";>'+errors.join(', ')+'</p>');				
    	field.siblings('p.'+this.errorTextClass).fadeIn('fast');				
    },
    removeErrors: function(field) {
    	$("#" + field.attr('id')+ ' + ' +'p.'+this.errorTextClass ).fadeOut().remove();								
    }