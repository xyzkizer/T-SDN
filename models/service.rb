class Service
  include DataMapper::Resource
  storage_names[:default] = "t_user_service"

  property :id,                 Serial
  property :name,               String
  property :rate,               Integer
  property :origin_rate,        Integer
  property :max_rate,           Integer
  property :origin_max_rate,    Integer
  property :signal_type,        Integer
  property :origin_signal_type, Integer
  property :manager_id,         Integer
  property :service_id,         String
  property :ovpn_id,         Integer

  belongs_to :manager
  belongs_to :ovpn, 'OVPN'
end
