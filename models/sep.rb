class ServiceEndPoint
  include DataMapper::Resource
  storage_names[:default] = "t_user_sep"

  property :id,              Serial
  property :manager_id,      Integer
  property :sep_id,          String

  belongs_to :manager
end
