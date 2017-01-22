class ServiceController < SDN

  get '/' do
    content_type :json

    services = {}
    services[:data] = []

    begin
      @user = Manager.first(:id => session[:user_id])
      if @user
        user_services = @user.services.map{|s| s.service_id }
        JSON.parse($redis.get(%Q(hw.ethService))).each do |uuid|
          s = JSON.parse($redis.get(uuid))
          next if s['role'] != '2'
          next if @user.role != "admin" and !user_services.include? s['name']
          s[:type] = "eth"
          services[:data] << s
        end
        JSON.parse($redis.get(%Q(hw.clientService))).each do |uuid|
          s = JSON.parse($redis.get(uuid))
          next if @user.role != "admin" and !user_services.include? s['name']
          s[:type] = "odu"
          services[:data] << s
        end
      else
        [401, %Q({"message":"user not exists."})]
      end
    rescue Exception => ex
      logger.error ex
    else
    ensure
      services[:count] = services[:data].length
    end
    [200, services.to_json]
  end

  post %r{/(?<name>.+)/?} do
    content = %Q({"bw":#{params[:bw]},"pir":#{params[:pir]}})
    begin
      if params[:type] == "eth"
        content = %Q({"bw":#{params[:bw]},"pir":#{params[:pir]}})
      elsif params[:type] == "odu"
        content = %Q({"signal_type":#{params[:signal_type]}})
      else
        [400, %Q({"message":"update hw service failure, unknown type!"})]
      end

      oper = "hw_mod_eth_srv"
      oper = "hw_mod_cli_srv" if params[:type] == "odu"

      @task = Task.new(
        :task_type => oper,
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params[:name],
        :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :content => content,
        :state => 0
      )

      if @task.save
        [200, %Q({"message":"update hw service success!"})]
      else
        [500, %Q({"message":"update hw service failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"update hw service exception!"})]
    else
    ensure
    end
  end

  delete %r{/(?<names>.+)/?} do
    begin
      params['names'].split(',').each do |name|

        oper = "hw_del_eth_srv"

        service = $redis.get(name)
        service = JSON.parse(service) if service

        if service
          oper = "hw_del_cli_srv" if !service['signal_type'].nil?
        else
          [400, %Q({"message":"delete hw service failure, service not exists!"})]
        end

        Task.new(
          :task_type => oper,
          :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :service_id => name,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
          :state => 0
        ).save
      end
      [200, %Q({"message":"delete hw service success!"})]
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"delete hw service exception!"})]
    else
    ensure
    end
  end

  post '/?' do
    content_type :json

    begin
      if params[:type] == "eth"
        content = %Q({
            "srv_type": 1,
            "srv_name": "#{params[:name]}",
            "sla": #{params[:sla]},
            "bw": #{params[:bw]},
            "pir": #{params[:pir]},
            "uni": [
              { "physical_port": "#{params[:nodes][0]}" },
              { "physical_port": "#{params[:nodes][1]}" }
            ]
        })
      elsif params[:type] == "odu"
        content = %Q({
            "signal_type": #{params[:signal_type]},
            "srv_name": "#{params[:name]}",
            "sla": #{params[:sla]},
            "ovpn_id": #{params[:ovpn_id]},
            "uni": [
              { "physical_port": "#{params[:nodes][0]}" },
              { "physical_port": "#{params[:nodes][1]}" }
            ]
        })
      else
        [400, %Q({"message":"add new hw service failure, unknown type!"})]
      end
      oper = "hw_add_eth_srv"
      oper = "hw_add_cli_srv" if params[:type] == "odu"

      @task = Task.new(
        :task_type => oper,
        :user_id => session['user_id'],
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :content => content,
        :state => 0
      )
      if @task.save
        [200, %Q({"message":"add new hw service success!"})]
      else
        [500, %Q({"message":"add new hw service failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"add new hw service exception!"})]
    else
    ensure
    end
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
