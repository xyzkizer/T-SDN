class Register
  include DataMapper::Resource
  storage_names[:default] = "t_service_register"

  property :id,           Serial
  property :from,         String
  property :to,           String
  property :rate,         Integer
  property :bandwidth,    Integer
  property :startAt,      DateTime
  property :endAt,        DateTime
  property :state,        Integer

end
