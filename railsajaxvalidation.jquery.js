(function($){
	/*
		Ajax Form Validation for Rails applications. This plugin is meant to be used with formastic, but 
		you can customize it for your application using call backs. How it works:
			1. On input change:
			2. Calls submits a json request to the form's action
			3. The controller returns the model's errors in json
			4. Errors are parsed from json
			5. Error messages are added into the dom using your callbacks
			
		Example usage:
		$(function() {
			$(#myform).railsAjaxValidation();
		});
	*/
	
	$.railsAjaxValidation = {
		settings: {
			errorTextClass: 'inline-errors',
			validClass: 'valid',
			invalidClass: 'invalid',
			enableLog: false,	
			showErrors: function(field,errors) {
				field.after('<p class="'+this.errorTextClass+'" style="display:none";>'+errors.join(', ')+'</p>');				
				field.siblings('p.'+this.errorTextClass).fadeIn('fast');				
			},
			removeErrors: function(field) {
				$("#" + field.attr('id')+ ' + ' +'p.'+this.errorTextClass ).fadeOut().remove();								
			},
		},
		
		observeField: function(field) {
			var callbacks = this.settings;
			field.change(function() {
				var form = field.parents('form:first');			
				
				$.post(form.attr('action'), form.serialize(),
					function(json) {			
						var errors = errorsOnAttribute(field.attr('id'), json);
						
						callbacks.removeErrors(field);
						field.removeClass(this.invalidClass);						
												
						if(!field.confirmationField() && errors.length > 0) {
							callbacks.showErrors(field, errors);	
							field.toggleClass(this.inValidClass);					
						} else if(shouldUpdateConfirmationField(field) && errors.length > 0) {
							callbacks.showErrors(field, errors);
							field.toggleClass(this.inValidClass);
						} else if(field.confirmationSource()) {
							field.confirmationSource().change();
						}	else { 
							callbacks.validField(field);
							field.toggleClass(this.validClass); 
						}
					}, "json");
			});
		}		
	}
	
	/* Public, $.fn methods -- available to all jQuery objects */
	
	$.fn.railsAjaxValidation = function(settings) {	
		if(settings) $.extend($.railsAjaxValidation.settings, settings);	
		
		this.each(function() {		
			$.railsAjaxValidation.settings.inputs = $(':input', $(this));
				
			$.railsAjaxValidation.settings.inputs.each(function(){					
				$.railsAjaxValidation.observeField($(this));					
			})
		});
		
		return this;
	};
	
	$.fn.confirmationField = function() {
		var confirmation_field_id = '#' + this.attr('id') + "_confirmation";
		var confirmation_field = $(confirmation_field_id);	
		
		if(confirmation_field.length > 0) {
			return confirmation_field;
		} else {
			return false;
		}
	};
	
	$.fn.confirmationSource = function() {
		var matches = this.attr('id').match(/(.+)_confirmation/);
		if(matches)
			return $('#'+matches[1]);
		else
			return false;		
	};
	
	/* private methods */	
	function errorsOnAttribute(attribute, json) {
		var errors = new Array();
	
		$.each(json, function() {					
			var json_attribute = this[0];					
			var regexp = new RegExp('(.+)_' + json_attribute + '$');
			if(attribute.match(regexp)) {
				errors.push(this[1]);
			}
		});
		console.log(errors);
		return errors;		
	};
	
	function shouldUpdateConfirmationField(field) {
		if(field.confirmationField()) { // field is password and there's an input named password_confirmation
			if(field.confirmationField().val().length > 0) return true;// and the confirmation field has been filled in
		}
		
		return false;
	};	 
})(jQuery);