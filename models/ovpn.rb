class OVPN
  include DataMapper::Resource
  storage_names[:default] = "t_user_ovpn"

  property :id,         Serial
  property :ovpn_id,         Integer
  property :name,       String
  property :remark,     String

  has n,   :services, 'Service'
end
