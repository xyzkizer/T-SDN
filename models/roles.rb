class Role
  include DataMapper::Resource

  property :id,         Serial
  property :name,       String
end
