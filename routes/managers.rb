class ManagerController < SDN

  get '/' do
    content_type :json

    users = {}
    users[:data] = Manager.all
    users[:count] = users[:data].length

    users.to_json
  end

  get '/*/services' do
    content_type :json
    @user = Manager.first(:username => params['splat'][0])

    if @user
      {:data => @user.services.map { |s| s.service_id } }.to_json
    else
      {:data => []}
    end

  end

  get '/*/seps' do
    content_type :json
    @user = Manager.first(:username => params['splat'][0])
    if @user
      {:data => @user.seps.map { |s| s.sep_id } }.to_json
    else
      {:data => []}
    end
  end

  post %r{/(?<username>.+)/?} do
    content_type :json
    logger.debug params

    @user = Manager.first(:username => params['username'])
    if @user
      unless params['services'] or params['bindPoints']
        @user.update(
          :name => params['name'],
          :password => params['password'],
          :email => params['email'],
          :role => params['role'],
          :mobile => params['mobile']
        )
      end
      if params['services']
        @user.services.destroy
        params['services'].each do |service|
          @user.services.create(:manager_id => @user.id, :service_id => service)
        end
      end

      if params['bindPoints']
        @user.seps.destroy
        params['bindPoints'].each do |sep|
          @user.seps.create(:manager_id => @user.id, :sep_id => sep)
        end
      end
      @user.errors.each do |e|
        logger.debug e
      end
      [200, %Q({"message":"updated!"})]
    else
      [500, %Q({"message":"failure!"})]
    end
  end

  delete %r{/(?<names>.+)/?} do
    logger.debug params
    Manager.all(:username => params['names'].split(',')).destroy
    # params['names'].split(',').each do |name|
    # end
    [200, %Q({"message":"deleted!"})]
  end

  post '/?' do
    content_type :json

    logger.debug params
    @user = Manager.create(
      :name => params['name'],
      :username => params['username'],
      :password => params['password'],
      :email => params['email'],
      :role => params['role'],
      :mobile => params['mobile']
    )
    if @user
      [200, %Q({"message":"created!"})]
    else
      @user.errors.each do |e|
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
