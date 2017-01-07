class ServiceRegisterController < SDN

  get '/' do
    content_type :json

    registers = Register.all

    %Q({"count":#{registers.length}, "data":#{registers.to_json}})
  end

end
