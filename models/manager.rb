class Manager
  include DataMapper::Resource
  storage_names[:default] = "users"

  property :id,         Serial
  property :name,       String
  property :username,   String
  property :email,      String
  property :password,   String
  property :role,       String
  property :mobile,     String

  has n,   :services
  has n,   :seps, 'ServiceEndPoint'

end
