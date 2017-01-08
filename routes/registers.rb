class ServiceRegisterController < SDN

  get '/' do
    content_type :json

    @registers = []
    adapter = DataMapper.repository(:default).adapter
    results = adapter.select("SELECT `id`, `service`, `rate`, `bandwidth`, `effective_date`, `start_at`, `end_at`, `everyday` FROM `t_service_register` ORDER BY `id`")

    register = '{"id":%s,"service":"%s","rate":%s,"bandwidth":%s,"effective_date":"%s","start_at":"%s", "end_at":"%s","everyday":%s}'

    results.each do |r|
      @registers << JSON.parse(register % [r.id,r.service,r.rate,r.bandwidth,r.effective_date,r.start_at,r.end_at,r.everyday])
    end

    %Q({"count":#{results.length}, "data":#{@registers.to_json}})
  end

  post '/' do
    content_type :json
    logger.debug params.inspect

    content = '{"connConstraint":{"requestedCapacity":{"committedInformationRate":%s,"totalSize":%s}}}'
    if params['everyday']
      @t1 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['startAt'],
        :content => content % [params['rate'], params['bandwidth']],
        :state => 0
      )

      @t2 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    else
      @t1 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['startAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )

      @t2 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    end
    @register = Register.new(
      :service => params['service']['name'][0]['value'],
      :rate => params['rate'],
      :bandwidth => params['bandwidth'],
      :effective_date => params['date'],
      :startAt => params['startAt'],
      :endAt => params['endAt'],
      :everyday => params['everyday']
    )

    if @t1.save and @t2.save and @register.save
      [200, %Q({"message":"done!"})]
    else
       @t1.errors.each do |e|
         logger.debug e
       end
       @t2.errors.each do |e|
         logger.debug e
       end
       @register.errors.each do |e|
         logger.debug e
       end
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
