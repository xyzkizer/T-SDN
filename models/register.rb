class Register
  include DataMapper::Resource
  storage_names[:default] = "t_service_register"

  property :id,              Serial
  property :service,         String
  property :rate,            Integer
  property :bandwidth,       Integer
  property :signal_type,     Integer
  property :effective_date,  Date
  property :startAt,         MySQLTime
  property :endAt,           MySQLTime
  property :everyday,        Boolean

  has n, :tasks, :constraint => :destroy

  def typecast_to_primitive(startAt)
    puts %Q(XXXXXXXXXXXXXXXXXXX -- #{startAt})
  end

end
