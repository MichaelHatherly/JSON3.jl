var documenterSearchIndex = {"docs":
[{"location":"#JSON3.jl-Documentation","page":"Home","title":"JSON3.jl Documentation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Depth = 4","category":"page"},{"location":"#Builtin-types","page":"Home","title":"Builtin types","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The JSON format is made up of just a few types: Object, Array, String, Number, Bool, and Null. In the JSON3 package, there are two main interfaces for interacting with these JSON types: 1) builtin and 2) struct mapping. For builtin reading, called like JSON3.read(json_string), the JSON3 package will parse a string or Vector{UInt8}, returning a default object that maps to the type of the JSON. For a JSON Object, it will return a JSON3.Object type, which acts like an immutable Dict, but has a more efficient view representation. For a JSON Array, it will return a JSON3.Array type, which acts like an immutable Vector, but also has a more efficient view representation. If the JSON Array has homogenous elements, the resulting JSON3.Array will be strongly typed accordingly. For the other JSON types (string, number, bool, and null), they are returned as Julia equivalents (String, Int64 or Float64, Bool, and nothing).","category":"page"},{"location":"","page":"Home","title":"Home","text":"One might wonder why custom JSON3.Object and JSON3.Array types exist instead of just returning Dict and Vector directly. JSON3 employs a novel technique inspired by the simdjson project, that is a  semi-lazy parsing of JSON to the JSON3.Object or JSON3.Array types. The technique involves using a type-less \"tape\" to note the positions of objects, arrays, and strings in a JSON structure, while avoiding the cost of materializing such objects. For \"scalar\" types (number, bool, and null), the values are parsed immediately and stored inline in the \"tape\". This can result in best of both worlds performance: very fast initial parsing of a JSON input, and very cheap access afterwards. It also enables efficiencies in workflows where only small pieces of a JSON structure are needed, because expensive objects, arrays, and strings aren't materialized unless accessed. One additional advantage this technique allows is strong typing of JSON3.Array{T}; because the type of each element is noted while parsing, the JSON3.Array object can then be constructed with the most narrow type possible without having to reallocate any underlying data (since all data is stored in a type-less \"tape\" anyway).","category":"page"},{"location":"","page":"Home","title":"Home","text":"The JSON3.Object supports the AbstactDict interface, but is read-only (it represents a view into the JSON string input), thus it supports obj[:x] and obj[\"x\"], as well as obj.x for accessing fields. It supports keys(obj) to see available keys in the object structure. You can call length(obj) to see how many key-value pairs there are, and it iterates (k, v) pairs like a normal Dict. It also supports the regular get(obj, key, default) family of methods. PLEASE NOTE that iterating key-value pairs from JSON3.Object will be much more performant than calling getindex or geton each key due to the internal \"view\" nature of the object.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The JSON3.Array{T} supports the AbstractArray interface, but like JSON3.Object is a view into the input JSON, hence is read-only. It supports normal array methods like length(A), size(A), iteration, and A[i] getindex methods. PLEASE NOTE that iterating a JSON3.Array will be much more performant than calling getindex on each index due to the internal \"view\" nature of the array.","category":"page"},{"location":"#Struct-API","page":"Home","title":"Struct API","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The builtin JSON API in JSON3 is efficient and simple, but sometimes a direct mapping to a Julia structure is desirable. JSON3 uses the simple, yet powerful \"struct mapping\" techniques from the StructTypes.jl package.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In general, custom Julia types tend to be one of: 1) \"data types\", 2) \"interface types\" and sometimes 3) \"abstract types\" with a known set of concrete subtypes. Data types tend to be \"collection of fields\" kind of types; fields are generally public and directly accessible, they might also be made to model \"objects\" in the object-oriented sense. In any case, the type is \"nominal\" in the sense that it's \"made up\" of the fields it has, sometimes even if just for making it more convenient to pass them around together in functions.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Interface types, on the other hand, are characterized by private fields; they contain optimized representations \"under the hood\" to provide various features/functionality and are useful via interface methods implemented: iteration, getindex, accessor methods, etc. Many package-provided libraries or Base-provided structures are like this: Dict, Array, Socket, etc. For these types, their underlying fields are mostly cryptic and provide little value to users directly, and are often explictly documented as being implementation details and not to be accessed under warning of breakage.","category":"page"},{"location":"","page":"Home","title":"Home","text":"What does all this have to do with mapping Julia structures to JSON? A lot! For data types, the most typical JSON representation is for each field name to be a JSON key, and each field value to be a JSON value. And when reading data types from JSON, we need to specify how to construct the Julia structure for the key-value pairs encountered while parsing. This can be considered a \"direct\" mapping of Julia struct types to JSON objects in that we try to map field to key directly. This is the \"data type\" view of json-to-Julia struct mapping.","category":"page"},{"location":"","page":"Home","title":"Home","text":"For interface types, however, we don't want to consider the type's fields at all, since they're \"private\" and not very meaningful. For these types, an alternative API is provided where a user can specify the StructTypes.StructType their type most closely maps to, one of StructTypes.DictType(), StructTypes.ArrayType(), StructTypes.StringType(), StructTypes.NumberType(), StructTypes.BoolType(), or StructTypes.NullType().","category":"page"},{"location":"","page":"Home","title":"Home","text":"For abstract types, it can sometimes be useful when reading a JSON structure to say that it will be one of a limited set of related types, with a specific JSON key in the structure signaling which concrete type the rest of the structure represents. JSON3 uses StructTypes.jl functionality to specify a StructTypes.AbstractType() for a type, along with a mapping of JSON key-type values to Julia subtypes that can be used to identify the concrete type while parsing.","category":"page"},{"location":"#DataTypes","page":"Home","title":"DataTypes","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"For \"data types\", we aim to directly specify the JSON reading/writing behavior with respect to a Julia type's fields. This kind of data type can signal its struct type in one of two ways:","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.Struct()\n# or\nStructTypes.StructType(::Type{MyType}) = StructTypes.Mutable()","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.Struct() is less flexible, yet more performant. For reading a StructTypes.Struct() from a JSON string input, each key-value pair is read in the order it is encountered in the JSON input, the keys are ignored, and the values are directly passed to the type at the end of the object parsing like MyType(val1, val2, val3). Yes, the JSON specification says that Objects are specifically un-ordered collections of key-value pairs, but the truth is that many JSON libraries provide ways to maintain JSON Object key-value pair order when reading/writing. Because of the minimal processing done while parsing, and the \"trusting\" that the Julia type constructor will be able to handle fields being present, missing, or even extra fields that should be ignored, this is the fastest possible method for mapping a JSON input to a Julia structure. If your workflow interacts with non-Julia APIs for sending/receiving JSON, you should take care to test and confirm the use of StructTypes.Struct() in the cases mentioned above: what if a field is missing when parsing? what if the key-value pairs are out of order? what if there extra fields get included that weren't anticipated? If your workflow is questionable on these points, or it would be too difficult to account for these scenarios in your type constructor, it would be better to consider the StructTypes.Mutable() option.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The slightly less performant, yet much more robust method for directly mapping Julia struct fields to JSON objects is via StructTypes.Mutable(). This technique requires your Julia type to be defined, at a minimum, like:","category":"page"},{"location":"","page":"Home","title":"Home","text":"mutable struct MyType\n    field1\n    field2\n    field3\n    # etc.\n\n    MyType() = new()\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note specifically that we're defining a mutable struct to allow field mutation, and providing a MyType() = new() inner constructor which constructs an \"empty\" MyType where isbits fields will be randomly initialied, and reference fields will be #undef. (Note that the inner constructor doesn't need to be exactly this, but at least needs to be callable like MyType(). If certain fields need to be intialized or zeroed out for security, then this should be accounted for in the inner constructor). For these mutable types, the type will first be initizlied like MyType(), then JSON parsing will parse each key-value pair in a JSON object, setting the field as the key is encountered, and converting the JSON value to the appropriate field value. This flow has the nice properties of: allowing parsing success even if fields are missing in the JSON structure, and if \"extra\" fields exist in the JSON structure that aren't apart of the Julia struct's fields, it will automatically be ignored. This allows for maximum robustness when mapping Julia types to arbitrary JSON objects that may be generated via web services, other language JSON libraries, etc.","category":"page"},{"location":"","page":"Home","title":"Home","text":"There are a few additional helper methods that can be utilized by StructTypes.Mutable() types to hand-tune field reading/writing behavior:","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.names(::Type{MyType}) = ((:field1, :json1), (:field2, :json2)): provides a mapping of Julia field name to expected JSON object key name. This affects both reading and writing. When reading the json1 key, the field1 field of MyType will be set. When writing the field2 field of MyType, the JSON key will be json2.\nStructTypes.excludes(::Type{MyType}) = (:field1, :field2): specify fields of MyType to ignore when reading and writing, provided as a Tuple of Symbols. When reading, if field1 is encountered as a JSON key, it's value will be read, but the field will not be set in MyType. When writing, field1 will be skipped when writing out MyType fields as key-value pairs.\nStructTypes.omitempties(::Type{MyType}) = (:field1, :field2): specify fields of MyType that shouldn't be written if they are \"empty\", provided as a Tuple of Symbols. This only affects writing. If a field is a collection (AbstractDict, AbstractArray, etc.) and isempty(x) === true, then it will not be written. If a field is #undef, it will not be written. If a field is nothing, it will not be written. \nStructTypes.keywordargs(::Type{MyType}) = (field1=(dateformat=dateformat\"mm/dd/yyyy\",), field2=(dateformat=dateformat\"HH MM SS\",)): Specify for a StructTypes.Mutable StructType the keyword arguments by field, given as a NamedTuple of NamedTuples, that should be passed","category":"page"},{"location":"","page":"Home","title":"Home","text":"to the StructTypes.construct method when deserializing MyType. This essentially allows defining specific keyword arguments you'd like to be passed for each field in your struct. Note that keyword arguments can be passed when reading, like JSON3.read(source, MyType; dateformat=...) and they will be passed down to each StructTypes.construct method. StructTypes.keywordargs just allows the defining of specific keyword arguments per field.","category":"page"},{"location":"#Interface-Types","page":"Home","title":"Interface Types","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"For interface types, we don't want the internal fields of a type exposed, so an alternative API is to define the closest JSON type that our custom type should map to. This is done by choosing one of the following definitions:","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.DictType()\nStructTypes.StructType(::Type{MyType}) = StructTypes.ArrayType()\nStructTypes.StructType(::Type{MyType}) = StructTypes.StringType()\nStructTypes.StructType(::Type{MyType}) = StructTypes.NumberType()\nStructTypes.StructType(::Type{MyType}) = StructTypes.BoolType()\nStructTypes.StructType(::Type{MyType}) = StructTypes.NullType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now we'll walk through each of these and what it means to map my custom Julia type to an interface type.","category":"page"},{"location":"#StructTypes.DictType","page":"Home","title":"StructTypes.DictType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.DictType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.DictType() means it should map to a JSON object of unordered key-value pairs, where keys are Symbol or String, and values are any other type (or Any).","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.DictType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Any subtype of AbstractDict\nAny NamedTuple type\nAny Pair type","category":"page"},{"location":"","page":"Home","title":"Home","text":"So if your type subtypes AbstractDict and implements its interface, then JSON reading/writing should just work!","category":"page"},{"location":"","page":"Home","title":"Home","text":"Otherwise, the interface to satisfy StructTypes.DictType() for reading is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"MyType(x::Dict{Symbol, Any}): implement a constructor that takes a Dict{Symbol, Any} of key-value pairs parsed from JSOn\nStructTypes.construct(::Type{MyType}, x::Dict; kw...): alternatively, you may overload the StructTypes.construct method for your type if defining a constructor is undesirable (or would cause other clashes or ambiguities)","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for writing is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"pairs(x): implement the pairs iteration function (from Base) to iterate key-value pairs to be written out to JSON\nStructTypes.keyvaluepairs(x::MyType): alternatively, you can overload the StructTypes.keyvaluepairs function if overloading pairs isn't possible for whatever reason","category":"page"},{"location":"#StructTypes.ArrayType","page":"Home","title":"StructTypes.ArrayType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.ArrayType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.ArrayType() means it should map to a JSON array of ordered elements, homogenous or otherwise.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.ArrayType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Any subtype of AbstractArray\nAny subtype of AbstractSet\nAny Tuple type","category":"page"},{"location":"","page":"Home","title":"Home","text":"So if your type already subtypes these and satifies the interface, things should just work.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Otherwise, the interface to satisfy StructTypes.ArrayType() for reading is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"MyType(x::Vector): implement a constructo that takes a Vector argument of values and constructs a MyType\nStructTypes.construct(::Type{MyType}, x::Vector; kw...): alternatively, you may overload the StructTypes.construct method for your type if defining a constructor isn't possible\nOptional: Base.IteratorEltype(::Type{MyType}) and Base.eltype(x::MyType): this can be used to signal to JSON3 that elements for your type are expected to be a single type and JSON3 will attempt to parse as such","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for writing is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"iterate(x::MyType): just iteration over each element is required; note if you subtype AbstractArray and define getindex(x::MyType, i::Int), then iteration is already defined for your type","category":"page"},{"location":"#StructTypes.StringType","page":"Home","title":"StructTypes.StringType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.StringType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.StringType() means it should map to a JSON string value.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.StringType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Any subtype of AbstractString\nThe Symbol type\nAny subtype of Enum (values are written with their symbolic name)\nThe Char type","category":"page"},{"location":"","page":"Home","title":"Home","text":"So if your type is an AbstractString or Enum, then things should already work.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Otherwise, the interface to satisfy StructTypes.StringType() for reading is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"MyType(x::String): define a constructor for your type that takes a single String argument\nStructTypes.construct(::Type{MyType}, x::String; kw...): alternatively, you may overload StructTypes.construct for your type\nStructTypes.construct(::Type{MyType}, ptr::Ptr{UInt8}, len::Int; kw...): another option is to overload StructTypes.construct with pointer and length arguments, if it's possible for your custom type to take advantage of avoiding the full string materialization; note that your type should implement both StructTypes.construct methods, since JSON strings with escape characters in them will be fully unescaped before calling StructTypes.construct(::Type{MyType}, x::String), i.e. there is no direct pointer/length method for escaped strings","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for writing is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Base.string(x::MyType): overload Base.string for your type to return a \"stringified\" value","category":"page"},{"location":"#StructTypes.NumberType","page":"Home","title":"StructTypes.NumberType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.NumberType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.NumberType() means it should map to a JSON number value.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.NumberType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Any subtype of Signed\nAny subtype of Unsigned\nAny subtype of AbstractFloat","category":"page"},{"location":"","page":"Home","title":"Home","text":"In addition to declaring StructTypes.NumberType(), custom types can also specify a specific, existing number type it should map to. It does this like:","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.numbertype(::Type{MyType}) = Float64","category":"page"},{"location":"","page":"Home","title":"Home","text":"In this case, I'm declaring the MyType should map to an already-supported number type Float64. This means that when reading, JSON3 will first parse a Float64 value, and then call MyType(x::Float64). Note that custom types may also overload StructTypes.construct(::Type{MyType}, x::Float64; kw...) if using a constructor isn't possible. Also note that the default for any type declared as StructTypes.NumberType() is Float64.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Similarly for writing, JSON3 will first call Float64(x::MyType) before writing the resulting Float64 value out as a JSON number.","category":"page"},{"location":"#StructTypes.BoolType","page":"Home","title":"StructTypes.BoolType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.BoolType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.BoolType() means it should map to a JSON boolean value.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.BoolType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Bool","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for reading is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"MyType(x::Bool): define a constructor that takes a single Bool value\nStructTypes.construct(::Type{MyType}, x::Bool; kw...): alternatively, you may overload StructTypes.construct","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for writing is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Bool(x::MyType): define a conversion to Bool method","category":"page"},{"location":"#StructTypes.NullType","page":"Home","title":"StructTypes.NullType","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.NullType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"Declaring my type is StructTypes.NullType() means it should map to the JSON value null.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Types already declared as StructTypes.NullType() include:","category":"page"},{"location":"","page":"Home","title":"Home","text":"nothing\nmissing","category":"page"},{"location":"","page":"Home","title":"Home","text":"The interface to satisfy for reading is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"MyType(): an empty constructor for MyType\nStructTypes.construct(::Type{MyType}, x::Nothing; kw...): alternatively, you may overload StructTypes.construct","category":"page"},{"location":"","page":"Home","title":"Home","text":"There is no interface for writing; if a custom type is declared as StructTypes.NullType(), then the JSON value null will be written.","category":"page"},{"location":"#AbstractTypes","page":"Home","title":"AbstractTypes","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"A final, uncommon option for struct mapping is declaring:","category":"page"},{"location":"","page":"Home","title":"Home","text":"StructTypes.StructType(::Type{MyType}) = StructTypes.AbstractType()","category":"page"},{"location":"","page":"Home","title":"Home","text":"When declaring my type as StructTypes.AbstractType(), you must also define StructTypes.subtypes, which should be a NamedTuple with subtype keys mapping to Julia subtype Type values. You may optionally define StructTypes.subtypekey that indicates which JSON key should be used for identifying the appropriate concrete subtype. A quick example should help illustrate proper use of this StructType:","category":"page"},{"location":"","page":"Home","title":"Home","text":"abstract type Vehicle end\n\nstruct Car <: Vehicle\n    type::String\n    make::String\n    model::String\n    seatingCapacity::Int\n    topSpeed::Float64\nend\n\nstruct Truck <: Vehicle\n    type::String\n    make::String\n    model::String\n    payloadCapacity::Float64\nend\n\nStructTypes.StructType(::Type{Vehicle}) = StructTypes.AbstractType()\nStructTypes.StructType(::Type{Car}) = StructTypes.Struct()\nStructTypes.StructType(::Type{Truck}) = StructTypes.Struct()\nStructTypes.subtypekey(::Type{Vehicle}) = :type\nStructTypes.subtypes(::Type{Vehicle}) = (car=Car, truck=Truck)\n\ncar = JSON3.read(\"\"\"\n{\n    \"type\": \"car\",\n    \"make\": \"Mercedes-Benz\",\n    \"model\": \"S500\",\n    \"seatingCapacity\": 5,\n    \"topSpeed\": 250.1\n}\"\"\", Vehicle)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here we have a Vehicle type that is defined as a StructTypes.AbstractType(). We also have two concrete subtypes, Car and Truck. In addition to the StructType definition, we also define StructTypes.subtypekey(::Type{Vehicle}) = :type, which signals to JSON3 that, when parsing a JSON structure, when it encounters the type key, it should use the value, in our example it's car, to discover the appropriate concrete subtype to parse the structure as, in this case Car. The mapping of JSON subtype key value to Julia Type is defined in our example via StructTypes.subtypes(::Type{Vehicle}) = (car=Car, truck=Truck). Thus, StructTypes.AbstractType is useful when the JSON structure to read includes a \"subtype\" key-value pair that can be used to parse a specific, concrete type; in our example, parsing the structure as a Car instead of a Truck.","category":"page"},{"location":"#Parametric-types","page":"Home","title":"Parametric types","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"When using parametric types define the StructTypes.StructType for all the subtypes of your parametric type:","category":"page"},{"location":"","page":"Home","title":"Home","text":"struct MyParametricType{T}\n    t::T\n    MyParametricType{T}(t) where {T} = new(t)\nend\nMyParametricType(t::T) where {T} = MyParametricType{T}(t)\n\nx = MyParametricType(1)\n\nStructTypes.StructType(::Type{<:MyParametricType}) = StructTypes.Struct() # note the `<:`\n                                                              # NOT like this StructTypes.StructType(::Type{MyParametricType})","category":"page"}]
}
