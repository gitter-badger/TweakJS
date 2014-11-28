###
  The view is the DOM controller. This should be used for code that doesnt really control any logic but how the view is displayed. For example animations.
  The view uses a templating engine to provide the html to the DOM.
  The view in common MV* frameworks is typically used to directly listen for model changes to rerender however typically this should be done in the controller.
  The data in the model is passed into the views template, allowing for easy manipulation of the view.
###
class tweak.View
 
  # @property [Integer] The uid of this object - for unique reference
  uid: 0
  # @property [*] The root relationship to this module
  root: null
  # @property [*] The direct relationship to this module
  relation: null

  require: tweak.Common.require
  splitComponents: tweak.Common.splitComponents
  findModule: tweak.Common.findModule

  # @private
  constructor: (@relation, @config = {}) ->
    # Set uid
    @uid = "v_#{tweak.uids.v++}"
    @root = relation.root or @
    @name = config.name or relation.name

  ###
    Default initialiser function - called when the view has rendered
  ###
  init: ->

  ###
    Renders the view, using a html template engine. The view is loaded async, this prevents the view from cloging up allowing for complex component structures.
    When the view has been rendered there is a event triggered. This allows an on ready for high components to be achieved, and to make sure that the DOM is available for access.
    The view wont be rendered until its parent view is rendered and any other components views that are waiting to be rendered.
    After the view is rendered the init method will be called.
    There is many options available for rendering through the view class, allowing for powerful rendering functionality.
    However this is quite a perfmormance heavy part of the framework so help tidiing things up would be much appreciated.

    @todo Reduce the complexity of the rendering functionality
    @event "#{@name}:view:rendered" The event is called when the view has been rendered.
    @event "#{@component.uid}:view:rendered" The event is called when the view has been rendered.
    @event "#{@uid}:rendered" The event is called when the view has been rendered.
  ###
  render: ->
    if not @model? then throw new Error "There is no model attached to the view - cannot render"
    @config.attach ?= {}
    @model.data.rendering = true
    
    # Makes sure that there is an id for this component set, either by the config or by its name
    @model.data.id = @name.replace /\//g, "-"
    # Build the template with the date from the model
    template = if @config.template then @require @config.template, @name else @findModule @relation.paths, 'template', @name
    template = template @model.data
    
    @asyncHTML template, (template) =>
      # Attach nodes to the dome
      # It can either replace whats is in its parent node, or append after or be inserted before.
      attach = =>
        @parent = parent = @getParent()
        switch @config.attach.method or 'after'
          when 'bottom', 'after'
            @parent.appendChild template
            @el = @parent.lastElementChild
          when 'top', 'before'
            @parent.insertBefore template, @parent.firstChild
            @el = @parent.firstElementChild
          when 'replace'
            for item in @parent.children
              try
                @parent.removeChild item
              catch e
            @parent.appendChild template
            @el = @parent.firstElementChild

        @addClass @el, @model.get "id"
        @addClass @el, @config.class or ""
        @model.set "rendering", false
        tweak.Common.__trigger @, "view:rendered"
        @init()
     
      # Check if other components are waiting to finish rendering, if they are then wait to attach to DOM
      tweak.Events.on @, "#{@uid}:renderable", ->
        attach()
      @__renderable @

    # Set viewable height and width
    @viewable = tweak.Viewable

    return

  ###
    @private
    Detirmine if view is ready to render
    If renderable event is triggered to start rendering
  ###
  __renderable: (ctx) ->
    setTimeout(->
      tweak.Events.trigger "#{ctx.uid}:renderable"
    ,0)

  ###
    The view will be cleared then rendered again.
    @event "#{@name}:view:rerendered" The event is called when the view has been rerendered.
    @event "#{@component.uid}:view:rerendered" The event is called when the view has been rerendered.
    @event "#{@uid}:rerendered" The event is called when the view has been rerendered.
  ###
  rerender: ->
    @clear()
    @render()
    tweak.Events.on @, "#{@uid}:rendered", -> tweak.Common.__trigger @, "view:rerendered"

  ###
    Get the chidlren nodes of an element
    @param [DOMElement] parent The element to get the children nodes of
    @return [Array<DOMElement>] Returns an array of children nodes from a parent Element
  ###
  getChildren: (parent) =>
    nodes = []
    children = (node = {}) =>
      node.children ?= []
      for element in node.children
        # Check if that a node is part of a lower down component
        # If it is then we do not want to loop through it later
        # so we can ignore it
        par = @component.parent
        if par.components
          for component in par.components.data
            if component.view.el is element then continue
        if element.children then children element
        nodes.push element
    # If the parent is the body then put it is the nodes array
    # This allows full web apps that hook into the body
    html = document.getElementsByTagName("html")[0]
    if parent.body is html then nodes.push html
    children parent
    nodes

  ###
    Find a component node by a value (attribute to apply on html is data-attach)
    @param [DOMElment] parent The parent DOMElement to search through to find a given component node
    @param [String] value The component name to look for in the data-attach attribute
    @return [DOMElement] Returns the dom element with matching critera
  ###
  getComponentNode: (parent, value) ->
    nodes = @getChildren parent
    nodes.push parent
    for prop in nodes
      if child then break
      try
        component = prop.getAttribute 'data-attach' or ''
      catch e
      if not component or component is ' ' then continue
      for val in @splitComponents @, component
        if value is val then child = prop
    child

  ###
    Clears the view and removed event listeners of DOM elements
  ###
  clear: ->
    if @el?.parentNode
      try
        @el.parentNode.removeChild @el
        @el = null

  ###
    Checks to see if the item is rendered; this is detirmined if the node has a parentNode
    @return [Boolean] Returns whether the view has been rendered.
  ###
  isRendered: -> if document.getElementsByTagName("html")[0].contains @el then true else false
  
  ###
    Find the parent DOMElement to this view
    @return [DOMElement] Returns the parent DOMElement
    @throw When looking for a parrent Element and there is not a returnable element you will recieve the following error - "Unable to find view parent for #{@name} (#{name})"
  ###
  getParent: ->
    view = @component.parent?.view
    # The result is the parent el, or it will try to find a node to attach to in the DOM
    html = document.getElementsByTagName("html")[0]
    parent = view?.el or html
    name = @config.attach?.to or @config.attach?.name or @name
    @getComponentNode(parent, name) or @getComponentNode(html, name) or parent or throw new Error "Unable to find view parent for #{@name} (#{name})"
  
  ###
    Async html to a function, this allows dynamic building of components without holding up parts of the system
    @param [String] HTML A String containing html to build into a dom object
    @param [Function] callback A method to pass the built up dom object to
  ###
  asyncHTML: (HTML, callback) ->
    setTimeout(->
      temp = document.createElement "div"
      frag = document.createDocumentFragment()
      temp.innerHTML = HTML
      callback temp.firstChild
    ,
    0)