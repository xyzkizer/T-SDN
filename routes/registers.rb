class ServiceRegisterController < SDN

  get '/' do
    protected!
    content_type :json
    registers = {}
    registers[:data] = []
    @user = Manager.first(:id => session['user_id'])

    begin

      if @user and @user.role == "operator"
        services = @user.services.map { |s|
          s.service_id
        }
        Register.all.each do |register|
          next unless services.include? register.service
          registers[:data] << register
        end
      elsif @user.role == "admin"
        registers[:data] = Register.all
      end

    rescue Exception => ex
      logger.error ex
      # [500, %Q({"message":"select user registers exception."})]
    else
    ensure
      registers[:count] = registers[:data].length
    end
    [200, registers.to_json]
  end

  delete %r{/(?<ids>.+)/?} do
    content_type :json
    begin
      Register.all(:conditions => [ 'id IN ?', params[:ids].split(',')]).each do |r|
        r.destroy
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"delete user registers exception."})]
    else
    ensure
    end
    [200, %Q({"message":"delete user register success."})]
  end

  post '/' do
    content_type :json
    begin
      register = Register.create(
        :service => params['service']['name'],
        :rate => params['rate'],
        :bandwidth => params['bandwidth'],
        :signal_type => params['signal_type'],
        :effective_date => params['date'],
        :startAt => params['startAt'],
        :endAt => params['endAt'],
        :everyday => params['everyday']
      )
      oper = "hw_mod_eth_srv"
      oper = "hw_mod_cli_srv" if params['type'] == "odu"

      if params['type'] == "eth"
        content = %Q({"bw":#{params['bw']},"pir":#{params['pir']}})
        content_origin = %Q({"bw":#{params['service']['bw']},"pir":#{params['service']['pir']}})
      elsif params['type'] == "odu"
        content = %Q({"signal_type":#{params['signal_type']}})
        content_origin = %Q({"signal_type":#{params['service']['signal_type']}})
      else
        [400, %Q({"message":"create user registers failure, unknown type."})]
      end

      if params['everyday']
        register.tasks.create(
          :task_type => oper,
          :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :service_id => params['service']['name'],
          :effective_time => params['startAt'],
          :content => content,
          :state => 0
        )

        register.tasks.create(
          :task_type => oper,
          :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :service_id => params['service']['name'],
          :effective_time => params['endAt'],
          :content => content_origin,
          :state => 0
        )
      else
        register.tasks.create(
          :task_type => oper,
          :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :service_id => params['service']['name'],
          :effective_date => params['date'],
          :effective_time => params['startAt'],
          :content => content,
          :state => 0
        )

        register.tasks.create(
          :task_type => oper,
          :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :service_id => params['service']['name'],
          :effective_date => params['date'],
          :effective_time => params['endAt'],
          :content => content_origin,
          :state => 0
        )
      end

    rescue Exception => ex
      logger.error ex
    else
    ensure
    end
    [200, %Q({"message":"create hw register success!"})]
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
