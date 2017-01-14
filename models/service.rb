class Service
  include DataMapper::Resource
  storage_names[:default] = "t_user_service"

  property :id,              Serial
  property :name,            String
  property :rate,            Integer
  property :max_rate,        Integer
  property :manager_id,      Integer
  property :service_id,      String

  belongs_to :manager

end
