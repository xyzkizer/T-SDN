class ServiceController < SDN

  get '/' do
    content_type :json

    services = {}
    services[:data] = []
    JSON.parse($redis.get(%Q(#{$redis.get("root-topolopy")}.connService))).each do |uuid|
      services[:data] << JSON.parse($redis.get(uuid))
    end
    services[:count] = services[:data].length

    services.to_json
  end

  post '/' do
    content_type :json
    logger.debug params.inspect
    content = %Q({
         "servicePort": [
           {
             "_serviceEndPoint": "#{params['to']}"
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
      :task_type => 0,
      :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L"),
      :effective_time => params['startAt'],
      :content => content,
      :state => 0
    )
    if @task.save
      [200, %Q({"message":"done!"})]
    else
      [500, %Q({"message":"failure!")]
    end
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
