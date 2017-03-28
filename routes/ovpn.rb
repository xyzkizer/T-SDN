class OVPNController < SDN

  get '/odulinks' do
    content_type :json

    odulinks = []
    begin
      JSON.parse($redis.get(%Q(hw_tsdn.node))).each do |node|
        links = JSON.parse($redis.get(%Q(#{node}.otnLink)))

        links.each do |name|
          link = JSON.parse($redis.get(name))
          next if link["status"] != 0
          odulinks << link["name"]
        end
      end
    rescue Exception => ex
      logger.error ex
    else
    ensure
    end
    [200, odulinks.to_json]
  end

  delete %r{/odulinks/(?<id>.+)?} do
      content_type :json
    begin
      @task = Task.new(
          :task_type => 'hw_del_ovpn_res',
          :local_id => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :content => %Q({ "ovpn_id": "#{params[:id]}", "links": #{params[:links]} }),
          :state => 0
      )
      if @task.save
        [200, %Q({"message":"del hw ovpn link success!"})]
      else
        [500, %Q({"message":"del hw ovpn link failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"delete hw ovpn link exception!"})]
    else
    ensure

    end
  end

  post '/odulinks' do
    content_type :json
    begin
      if params[:odulinks] and params[:id]
        content = %Q({
            "ovpn_id": #{params[:id]},
            "link": #{params[:odulinks]}
        })
        @task = Task.new(
            :task_type => "hw_add_ovpn_link",
            :user_id => session['user_id'],
            :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
            :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
            :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
            :content => content,
            :state => 0
        )
        if @task.save
          [200, %Q({"message":"add new hw ovpn link success!"})]
        else
          [500, %Q({"message":"add new hw ovpn link failure!"})]
        end
      end

    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"add new hw ovpn link exception!"})]
    else
    ensure
    end
  end

  get '/' do
    content_type :json
    ovpns = {}
    ovpns[:data] = []

    begin
      @user = Manager.first(:id => session[:user_id])
      if @user
        user_ovpns = @user.ovpns.map { |o| %Q(ovpn_#{o.ovpn_id}) }
        JSON.parse($redis.get("hw.ovpn")).each do |idx|
          next if @user.role != "admin" and !user_ovpns.include? idx
          svr = $redis.get(idx)
          ovpns[:data] << JSON.parse(svr) if svr
        end
      else
        [401, %Q({"message":"user not exists."})]
      end
    rescue Exception => ex
      logger.error ex
    else
    ensure
      ovpns[:count] = ovpns[:data].length
    end
    [200, ovpns.to_json]
  end

  get '/services' do
    content_type :json

    services = {}
    services[:data] = []

    begin
      @user = Manager.first(:id => session[:user_id])
      if @user
        user_services = @user.services.map { |s| s.service_id }
        JSON.parse($redis.get(%Q(hw.clientService))).each do |uuid|
          s = JSON.parse($redis.get(uuid))
          next if @user.role != "admin" and !user_services.include? s['name']
          next if s['ovpn_id'] != 0
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

  post '/services' do
    content_type :json
    begin
      @task = Task.new(
          :task_type => 'hw_add_ovpn_res',
          :local_id => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :content => %Q({ "ovpn_id": "#{params[:id]}", "services": #{params[:services]} }),
          :state => 0
      )
      if @task.save
        [200, %Q({"message":"add hw ovpn res success!"})]
      else
        [500, %Q({"message":"add hw ovpn res failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"add hw ovpn res exception!"})]
    ensure

    end
  end

  post '/' do
    content_type :json
    begin
      @task = Task.new(
          :task_type => 'hw_add_ovpn',
          :local_id => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :content => %Q({ "name": "#{params[:name]}", "remark": "" }),
          :state => 0
      )
      if @task.save
        [200, %Q({"message":"add hw ovpn success!"})]
      else
        [500, %Q({"message":"add hw ovpn failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"add hw ovpn exception!"})]
    ensure

    end
  end

  delete %r{/services/(?<id>.+)/(?<names>.+)/?} do
    content_type :json
    begin
      @task = Task.new(
          :task_type => 'hw_del_ovpn_service',
          :local_id => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :content => %Q({ "ovpn_id": "#{params[:id]}", "services": #{params[:names]} }),
          :state => 0
      )
      if @task.save
        [200, %Q({"message":"del hw ovpn res success!"})]
      else
        [500, %Q({"message":"del hw ovpn res failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"del hw ovpn res exception!"})]
    ensure
    end

  end

  delete %r{/(?<id>.+)/?} do
    content_type :json

    begin
      @task = Task.new(
          :task_type => 'hw_del_ovpn',
          :local_id => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
          :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S"),
          :service_id => %Q(ovpn_#{params[:id]}),
          :state => 0
      )
      if @task.save
        [200, %Q({"message":"delete hw ovpn success!"})]
      else
        [500, %Q({"message":"delete hw ovpn failure!"})]
      end
    rescue Exception => ex
      logger.error ex
      [500, %Q({"message":"delete hw ovpn exception!"})]
    ensure

    end

  end

  get %r{/(?<id>.+)/?} do
    content_type :json
    ovpn = {}
    ovpn[:links] = {}
    ovpn[:links][:data] = []
    ovpn[:services] = {}
    ovpn[:services][:data] = []

    ovpnservice = $redis.get(%Q(ovpn_#{params[:id]}.clientService))
    ovpnlink = $redis.get(%Q(ovpn_#{params[:id]}.otnLink))
    if ovpnservice
      JSON.parse(ovpnservice).each do |uuid|
        ovpn[:services][:data] << JSON.parse($redis.get(uuid))
        ovpn[:services][:count] = ovpn[:services][:data].length
      end
    end
    if ovpnlink
      JSON.parse(ovpnlink).each do |uuid|
        ovpn[:links][:data] << JSON.parse($redis.get(uuid))
        ovpn[:links][:count] = ovpn[:links][:data].length
      end
    end

    ovpn.to_json
  end

  before do
    if request.request_method == "POST" or request.request_method == "DELETE"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
