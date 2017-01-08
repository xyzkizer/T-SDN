class Service
  include DataMapper::Resource
  storage_names[:default] = "t_user_service"

  property :id,              Serial
  property :manager_id,      Integer
  property :service_id,      String

  belongs_to :manager

end
