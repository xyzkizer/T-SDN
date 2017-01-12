class ServiceController < SDN

  get '/' do
    content_type :json

    logger.debug session.inspect
    services = {}
    @user = Manager.first(:id => session[:user_id])

    if @user
      user_services = @user.services.map{|s| s.service_id }
      services[:data] = []
      JSON.parse($redis.get(%Q(#{$redis.get("root-topology")}.connService))).each do |uuid|
        s = JSON.parse($redis.get(uuid))
        next if @user.username != 'root' and !user_services.include? s['name'][0]['value']
        s['serviceEndPoints'] = JSON.parse($redis.get(%Q(#{s['name'][0]['value']}.serviceEndPoint)))
        services[:data] << s
      end
      services[:count] = services[:data].length
    end
    services.to_json
  end

  post %r{/(?<name>.+)/?} do
    content = %Q({"connConstraint":{"requestedCapacity":{"committedInformationRate":#{params['rate']},"totalSize":#{params['bandwidth']}}}})
    @task = Task.new(
      :task_type => 'tapi_mod_srv',
      :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
      :service_id => params['name'],
      :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :content => content,
      :state => 0
    )

    if @task.save
      [200, %Q({"message":"done!"})]
    else
      [500, %Q({"message":"failure!"})]
    end
  end

  delete %r{/(?<names>.+)/?} do
    params['names'].split(',').each do |name|
      Task.new(
        :task_type => 'tapi_del_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => name,
        :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
        :state => 0
      ).save
    end
    [200, %Q({"message":"done!"})]
  end

  post '/?' do
    content_type :json
    logger.debug params
    content = %Q({
         "servicePort": [
           {
             "_serviceEndPoint": "#{params['to']['display']}"
           },
           {
             "_serviceEndPoint": "#{params['from']}"
           }
         ],
         "connConstraint": {
           "requestedCapacity": {
             "committedInformationRate": #{params['rate']},
             "totalSize": #{params['bandwidth']}
           }
         }
    })

    @task = Task.new(
      :task_type => 'tapi_add_srv',
      :user_id => session['user_id'],
      :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :effective_date => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :effective_time => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :content => content,
      :state => 0
    )

    if @task.save
      [200, %Q({"message":"done!"})]
    else
      [500, %Q({"message":"failure!"})]
    end
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
