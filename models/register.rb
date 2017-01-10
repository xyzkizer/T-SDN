class Register
  include DataMapper::Resource
  storage_names[:default] = "t_service_register"

  property :id,              Serial
  property :service,         String
  property :rate,            Integer
  property :bandwidth,       Integer
  property :effective_date,  Date
  property :startAt,         Time
  property :endAt,           Time
  property :everyday,        Boolean

  has n, :tasks

  def typecast_to_primitive(startAt)
    logger.debug startAt

  end

end
